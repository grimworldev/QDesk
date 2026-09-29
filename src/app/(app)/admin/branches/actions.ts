"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isValidTimezone } from "@/lib/timezones";
import { isUuid, optStr, str, type ActionState } from "@/lib/form";

type Common = { name: string; address: string | null; timezone: string };
type Parsed = { error: string } | { values: Common };

function parseCommon(fd: FormData): Parsed {
  const name = str(fd, "name").replace(/\s+/g, " ");
  const timezone = str(fd, "timezone");

  if (!name) return { error: "Branch name is required." };
  if (name.length > 60)
    return { error: "Branch name is too long (max 60 characters)." };
  if (!isValidTimezone(timezone)) return { error: "Choose a valid timezone." };

  return { values: { name, address: optStr(fd, "address"), timezone } };
}

function duplicateMessage(error: {
  code?: string;
  message: string;
}): string | null {
  if (error.code !== "23505") return null;
  if (error.message.includes("branches_name_unique")) {
    return "A branch with this name already exists.";
  }
  return "That branch code is already used by another branch.";
}

export async function createBranch(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);

  const parsed = parseCommon(fd);
  if ("error" in parsed) return { error: parsed.error };

  const code = str(fd, "code").toUpperCase();
  if (!/^[A-Z0-9-]{2,10}$/.test(code)) {
    return {
      error:
        "Code must be 2 to 10 letters, numbers or hyphens (for example MAIN).",
    };
  }

  // is_active defaults to true in the database, so new branches start active
  const supabase = await createClient();
  const { error } = await supabase
    .from("branches")
    .insert({ code, ...parsed.values });
  if (error) return { error: duplicateMessage(error) ?? error.message };

  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}

export async function updateBranch(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);
  if (!isUuid(id)) return { error: "Invalid branch." };

  const parsed = parseCommon(fd);
  if ("error" in parsed) return { error: parsed.error };

  const isActive = str(fd, "is_active") !== "false";
  const supabase = await createClient();

  // Don't switch off a branch that still has people in line
  if (!isActive) {
    const { count } = await supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", id)
      .in("status", ["waiting", "called", "serving"]);
    if (count && count > 0) {
      return {
        error: `This branch still has ${count} open ticket(s). Finish or cancel them before deactivating.`,
      };
    }
  }

  // The code is intentionally not updated: it's locked after creation
  const { data, error } = await supabase
    .from("branches")
    .update({ ...parsed.values, is_active: isActive })
    .eq("id", id)
    .select("id");

  if (error) return { error: duplicateMessage(error) ?? error.message };
  if (!data?.length)
    return { error: "Branch not found, or you're not allowed to edit it." };

  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}
