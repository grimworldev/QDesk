import Link from "next/link";
import { ActionForm } from "@/components/form/action-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createService } from "../actions";
import { ServiceFields } from "../service-fields";

export default async function NewServicePage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: branches } = await supabase
        .from("branches")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

    return (
        <div className="mx-auto space-y-6">
            <div>
                <Link href="/admin/services" className="text-sm text-muted hover:text-primary">← Back to services</Link>
                <h1 className="mt-1 text-2xl font-semibold text-primary">Add service</h1>
            </div>

            <div className="card p-6">
                <ActionForm action={createService} submitLabel="Create service" cancelHref="/admin/services">
                    <ServiceFields mode="create" branches={branches ?? []} />
                </ActionForm>
            </div>
        </div>
    );
}