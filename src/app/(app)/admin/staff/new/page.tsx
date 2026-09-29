import Link from "next/link";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createStaff } from "../actions";
import { StaffFields } from "../staff-fields";

export default async function NewStaffPage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const [{ data: roles }, { data: branches }] = await Promise.all([
        supabase.from("roles").select("id, name").order("name"),
        supabase.from("branches").select("id, name").eq("is_active", true).order("name"),
    ]);

    return (
        <div className="mx-auto space-y-6">
            <div>
                <Link href="/admin/staff" className="text-sm text-muted hover:text-primary">← Back to staff</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Add staff member</h1>
            </div>

            <div className="card p-6">
                <ActionForm action={createStaff} submitLabel="Create account" cancelHref="/admin/staff">
                    <StaffFields mode="create" roles={roles ?? []} branches={branches ?? []} defaults={{ status: "active" }} />
                </ActionForm>
            </div>
        </div>
    );
}