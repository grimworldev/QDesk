import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { updateBranch } from "../actions";
import { BranchFields } from "../branch-fields";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();

    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: branch } = await supabase
        .from("branches")
        .select("id, name, code, address, timezone, is_active")
        .eq("id", id)
        .single();
    if (!branch) notFound();

    return (
        <div className="mx-auto space-y-6">
            <div>
                <Link href="/admin/branches" className="text-sm text-muted hover:text-primary">← Back to branches</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Edit {branch.name}</h1>
            </div>

            <div className="card p-6">
                <ActionForm
                    action={updateBranch.bind(null, id)}
                    submitLabel="Save changes"
                    cancelHref="/admin/branches"
                >
                    <BranchFields mode="edit" defaults={branch} />
                </ActionForm>
                <p className="mt-4 text-xs text-muted">
                    Changing the timezone affects when ticket numbers reset from the next day on. Existing tickets are unchanged.
                </p>
            </div>
        </div>
    );
}