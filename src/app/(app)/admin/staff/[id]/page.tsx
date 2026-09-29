import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { resetStaffPassword, updateStaff } from "../actions";
import { StaffFields } from "../staff-fields";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();

    const me = await requireRole(["admin"]);
    const supabase = await createClient();

    const [{ data: person }, { data: roles }, { data: branches }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, first_name, middle_name, last_name, email, phone, status, role_id, branch_id")
            .eq("id", id)
            .single(),
        supabase.from("roles").select("id, name").order("name"),
        supabase.from("branches").select("id, name").eq("is_active", true).order("name"),
    ]);
    if (!person) notFound();

    const isSelf = person.id === me.id;

    return (
        <div className="mx-auto space-y-6">
            <div>
                <Link href="/admin/staff" className="text-sm text-muted hover:text-primary">← Back to staff</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">
                    Edit {person.first_name} {person.last_name}
                </h1>
            </div>

            <div className="card p-6">
                <ActionForm action={updateStaff.bind(null, id)} submitLabel="Save changes" cancelHref="/admin/staff">
                    <StaffFields
                        mode="edit"
                        email={person.email}
                        roles={roles ?? []}
                        branches={branches ?? []}
                        defaults={person}
                        lockAccess={isSelf}
                    />
                </ActionForm>
            </div>

            <div className="card p-6">
                <h2 className="mb-1 font-semibold">Reset password</h2>
                <p className="mb-4 text-sm text-muted">Set a new password for this person. Nothing is emailed.</p>
                <ActionForm action={resetStaffPassword.bind(null, id)} submitLabel="Set new password">
                    <input name="password" type="password" required minLength={8} placeholder="New password (min 8)" className="input" />
                </ActionForm>
            </div>
        </div>
    );
}