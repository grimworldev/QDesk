"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isUuid, str, type ActionState } from "@/lib/form";

const DUPLICATE = "A window with this name already exists in this branch.";

function parse(fd: FormData) {
  const name = str(fd, "name").replace(/\s+/g, " ");
  const serviceIds = [...new Set(fd.getAll("service_ids").map(String))];

  if (!name) return { error: "Window name is required." };
  if (name.length > 40)
    return { error: "Window name is too long (max 40 characters)." };
  if (serviceIds.length === 0)
    return { error: "Choose at least one service for this window." };
  if (!serviceIds.every(isUuid)) return { error: "Invalid service selected." };
  return { name, serviceIds };
}

export async function createWindow(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);

  const branchId = str(fd, "branch_id");
  if (!isUuid(branchId)) return { error: "Choose a branch." };

  const parsed = parse(fd);
  if ("error" in parsed) return { error: parsed.error };

  // New windows start closed and active (database defaults)
  const supabase = await createClient();
  const { data: win, error } = await supabase
    .from("windows")
    .insert({ branch_id: branchId, name: parsed.name })
    .select("id")
    .single();
  if (error || !win) {
    return {
      error:
        error?.code === "23505"
          ? DUPLICATE
          : (error?.message ?? "Could not create the window."),
    };
  }

  const { error: svcError } = await supabase.rpc("set_window_services", {
    p_window: win.id,
    p_services: parsed.serviceIds,
  });
  if (svcError) {
    await supabase.from("windows").delete().eq("id", win.id); // don't leave a half-made window
    return { error: svcError.message };
  }

  revalidatePath("/admin/windows");
  redirect("/admin/windows");
}

export async function updateWindow(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);
  if (!isUuid(id)) return { error: "Invalid window." };

  const parsed = parse(fd);
  if ("error" in parsed) return { error: parsed.error };

  const isActive = str(fd, "is_active") !== "false";
  const supabase = await createClient();

  if (!isActive) {
    const { data: cur } = await supabase
      .from("windows")
      .select("status")
      .eq("id", id)
      .single();
    if (cur && cur.status !== "closed") {
      return {
        error: "This window is in use. Ask the staff member to close it first.",
      };
    }
  }

  const { data, error } = await supabase
    .from("windows")
    .update({ name: parsed.name, is_active: isActive })
    .eq("id", id)
    .select("id");
  if (error)
    return { error: error.code === "23505" ? DUPLICATE : error.message };
  if (!data?.length)
    return { error: "Window not found, or you're not allowed to edit it." };

  const { error: svcError } = await supabase.rpc("set_window_services", {
    p_window: id,
    p_services: parsed.serviceIds,
  });
  if (svcError) return { error: svcError.message };

  revalidatePath("/admin/windows");
  redirect("/admin/windows");
}
