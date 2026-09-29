"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import {
  USER_STATUSES,
  isUuid,
  optStr,
  str,
  type ActionState,
  type UserStatus,
} from "@/lib/form";

function readNameFields(fd: FormData) {
  return {
    first_name: str(fd, "first_name"),
    middle_name: optStr(fd, "middle_name"),
    last_name: str(fd, "last_name"),
    phone: optStr(fd, "phone"),
  };
}

async function isKioskRole(roleId: string) {
  const { data } = await supabaseAdmin
    .from("roles")
    .select("code")
    .eq("id", roleId)
    .maybeSingle();
  return data?.code === "kiosk";
}

export async function createStaff(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]); // FIRST line: this action uses the secret key, RLS won't help here

  const names = readNameFields(fd);
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const roleId = str(fd, "role_id");
  const branchId = optStr(fd, "branch_id");
  const status = str(fd, "status");

  if (!names.first_name || !names.last_name)
    return { error: "First and last name are required." };
  if (!/^\S+@\S+\.\S+$/.test(email))
    return { error: "Enter a valid email address." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (!isUuid(roleId)) return { error: "Choose a role." };
  if (branchId && !isUuid(branchId)) return { error: "Invalid branch." };
  if (!USER_STATUSES.includes(status as UserStatus))
    return { error: "Invalid status." };
  if ((await isKioskRole(roleId)) && !branchId) {
    return { error: "A kiosk account needs a branch." };
  }

  // 1. Create the login. The database trigger creates a basic profile row automatically.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // no confirmation email needed
    user_metadata: { first_name: names.first_name, last_name: names.last_name },
  });
  if (error || !data.user)
    return { error: error?.message ?? "Could not create the user." };

  // 2. Fill in the real role, branch, status and details on that profile.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      ...names,
      role_id: roleId,
      branch_id: branchId,
      status: status as UserStatus,
    })
    .eq("id", data.user.id);

  if (profileError) {
    // Roll back so we never leave a login with the wrong role
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return { error: `Could not save the profile: ${profileError.message}` };
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateStaff(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const me = await requireRole(["admin"]);
  if (!isUuid(id)) return { error: "Invalid user." };

  const names = readNameFields(fd);
  if (!names.first_name || !names.last_name)
    return { error: "First and last name are required." };

  const patch: Database["public"]["Tables"]["profiles"]["Update"] = {
    ...names,
  };

  // Admins can't change their own role/status/branch (prevents locking yourself out)
  if (id !== me.id) {
    const roleId = str(fd, "role_id");
    const branchId = optStr(fd, "branch_id");
    const status = str(fd, "status");
    if (!isUuid(roleId)) return { error: "Choose a role." };
    if (branchId && !isUuid(branchId)) return { error: "Invalid branch." };
    if (!USER_STATUSES.includes(status as UserStatus))
      return { error: "Invalid status." };
    if ((await isKioskRole(roleId)) && !branchId) {
      return { error: "A kiosk account needs a branch." };
    }
    patch.role_id = roleId;
    patch.branch_id = branchId;
    patch.status = status as UserStatus;
  }

  // Normal client: your RLS policy (profiles_admin) is also enforced here
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("id");
  if (error) return { error: error.message };
  if (!data?.length)
    return { error: "User not found, or you're not allowed to edit it." };

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function resetStaffPassword(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole(["admin"]);
  if (!isUuid(id)) return { error: "Invalid user." };

  const password = str(fd, "password");
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password,
  });
  if (error) return { error: error.message };
  return { success: "Password updated." };
}
