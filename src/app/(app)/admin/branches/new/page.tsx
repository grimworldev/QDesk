import Link from "next/link";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { createBranch } from "../actions";
import { BranchFields } from "../branch-fields";

export default async function NewBranchPage() {
    await requireRole(["admin"]);

    return (
        <div className="mx-auto space-y-6">
            <div>
                <Link href="/admin/branches" className="text-sm text-muted hover:text-primary">← Back to branches</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Add branch</h1>
            </div>

            <div className="card p-6">
                <ActionForm action={createBranch} submitLabel="Create branch" cancelHref="/admin/branches">
                    <BranchFields mode="create" />
                </ActionForm>
            </div>
        </div>
    );
}