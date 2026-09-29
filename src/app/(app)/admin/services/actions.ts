"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isUuid, optStr, str, type ActionState } from "@/lib/form";

type Parsed =
  | { error: string }
  | { values: { name: string; code: string; description: string | null } };

function parseFields(fd: FormData): Parsed {
  // collapse extra spaces: "  Cash   ier " -> "Cash ier"
  const name = str(fd, "name").replace(/\s+/g, " ");
  const code = str(fd, "code").toUpperCase();

  if (!name) return { error: "Service name is required." };
  if (name.length > 60)
    return { error: "Service name is too long (max 60 characters)." };
  if (!/^[A-Z0-9]{1,3}$/.test(code)) {
    return {
      error: "Code must be 1 to 3 letters or numbers (for example C or PWD).",
    };
  }
  return { values: { name, code, description: optStr(fd, "description") } };
}

/** Turn a database duplicate error into a clear message */
function duplicateMessage(error: {
  code?: string;
  message: string;
}): string | null {
  if (error.code !== "23505") return null;
  if (error.message.includes("services_branch_name_unique")) {
    return "A service with this name already exists in this branch.";
  }
  return "That ticket code is already used by another service in this branch.";
}

export async function createService(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);

  const branchId = str(fd, "branch_id");
  if (!isUuid(branchId)) return { error: "Choose a branch." };

  const parsed = parseFields(fd);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .insert({ branch_id: branchId, ...parsed.values });

  if (error) return { error: duplicateMessage(error) ?? error.message };

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateService(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);
  if (!isUuid(id)) return { error: "Invalid service." };

  const parsed = parseFields(fd);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error) return { error: duplicateMessage(error) ?? error.message };
  if (!data?.length)
    return { error: "Service not found, or you're not allowed to edit it." };

  revalidatePath("/admin/services");
  redirect("/admin/services");
}
