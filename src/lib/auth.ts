import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RoleCode = "admin" | "supervisor" | "staff" | "kiosk";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, status, branch_id, roles(code, name)",
    )
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  const roleRow = Array.isArray(profile.roles)
    ? profile.roles[0]
    : profile.roles;
  if (!roleRow) return null; // never guess a role

  return {
    ...profile,
    role: roleRow.code as RoleCode,
    roleName: roleRow.name,
  };
});

/** Staff area: logged in, active, and NOT a kiosk account. */
export async function requireUser() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.status !== "active") redirect("/pending");
  if (me.role === "kiosk") redirect("/kiosk");
  return me;
}

export async function requireRole(allowed: RoleCode[]) {
  const me = await requireUser();
  if (!allowed.includes(me.role)) redirect("/dashboard");
  return me;
}

/** Kiosk area: an active kiosk account that has a branch. */
export async function requireKiosk() {
  const me = await getCurrentUser();
  if (!me) redirect("/kiosk/login");
  if (me.status !== "active" || me.role !== "kiosk" || !me.branch_id) {
    redirect("/kiosk/login?error=access");
  }
  return { ...me, branch_id: me.branch_id };
}
