import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { isUuid, one } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { updateService } from "../actions";
import { ServiceFields } from "../service-fields";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();

    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: service } = await supabase
        .from("services")
        .select("id, name, code, description, branches(name)")
        .eq("id", id)
        .single();
    if (!service) notFound();

    return (
        <div className="mx-auto space-y-6">
            <div>
                <Link href="/admin/services" className="text-sm text-muted hover:text-primary">← Back to services</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Edit {service.name}</h1>
            </div>

            <div className="card p-6">
                <ActionForm
                    action={updateService.bind(null, id)}
                    submitLabel="Save changes"
                    cancelHref="/admin/services"
                >
                    <ServiceFields mode="edit" branchName={one(service.branches)?.name} defaults={service} />
                </ActionForm>
                <p className="mt-4 text-xs text-muted">
                    Changing the code only affects new tickets. Existing tickets keep their numbers.
                </p>
            </div>
        </div>
    );
}