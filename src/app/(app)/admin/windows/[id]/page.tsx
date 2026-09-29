import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { updateWindow } from "../actions";
import { WindowFields } from "../window-fields";

export default async function EditWindowPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();

    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: win } = await supabase
        .from("windows")
        .select("id, name, branch_id, is_active")
        .eq("id", id)
        .single();
    if (!win) notFound();

    const [{ data: branches }, { data: services }, { data: chosen }] = await Promise.all([
        supabase.from("branches").select("id, name").eq("id", win.branch_id),
        supabase
            .from("services")
            .select("id, name, code, branch_id")
            .eq("branch_id", win.branch_id)
            .eq("is_active", true)
            .order("code"),
        supabase.from("window_services").select("service_id").eq("window_id", id),
    ]);

    return (
        <div className="mx-auto  space-y-6">
            <div>
                <Link href="/admin/windows" className="text-sm text-muted hover:text-primary">← Back to windows</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Edit {win.name}</h1>
            </div>
            <div className="card p-6">
                <ActionForm action={updateWindow.bind(null, id)} submitLabel="Save changes" cancelHref="/admin/windows">
                    <WindowFields
                        mode="edit"
                        branches={branches ?? []}
                        services={services ?? []}
                        defaults={{
                            name: win.name,
                            branch_id: win.branch_id,
                            is_active: win.is_active,
                            service_ids: (chosen ?? []).map((c) => c.service_id),
                        }}
                    />
                </ActionForm>
            </div>
        </div>
    );
}