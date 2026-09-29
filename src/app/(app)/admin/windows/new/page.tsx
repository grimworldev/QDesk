import Link from "next/link";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createWindow } from "../actions";
import { WindowFields } from "../window-fields";

export default async function NewWindowPage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const [{ data: branches }, { data: services }] = await Promise.all([
        supabase.from("branches").select("id, name").eq("is_active", true).order("name"),
        supabase.from("services").select("id, name, code, branch_id").eq("is_active", true).order("code"),
    ]);

    return (
        <div className="mx-auto  space-y-6">
            <div>
                <Link href="/admin/windows" className="text-sm text-muted hover:text-primary">← Back to windows</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Add window</h1>
            </div>
            <div className="card p-6">
                <ActionForm action={createWindow} submitLabel="Create window" cancelHref="/admin/windows">
                    <WindowFields mode="create" branches={branches ?? []} services={services ?? []} />
                </ActionForm>
            </div>
        </div>
    );
}