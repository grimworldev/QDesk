import { requireKiosk } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { KioskClient } from "./kiosk-client";

export const dynamic = "force-dynamic";

export default async function KioskPage({
    searchParams,
}: {
    searchParams: Promise<{ autoprint?: string }>;
}) {
    const me = await requireKiosk();
    const { autoprint } = await searchParams;

    // Normal client: RLS lets a kiosk read only its own branch and that branch's services
    const supabase = await createClient();

    const { data: branch } = await supabase
        .from("branches")
        .select("id, name, code, timezone")
        .eq("id", me.branch_id)
        .eq("is_active", true)
        .maybeSingle();

    if (!branch) {
        return (
            <main className="flex min-h-svh items-center justify-center p-6 text-center">
                <p className="max-w-sm text-muted">
                    This kiosk's branch is not active. Please contact an administrator.
                </p>
            </main>
        );
    }

    const { data: services } = await supabase
        .from("services")
        .select("id, name, code, description")
        .eq("branch_id", branch.id)
        .eq("is_active", true)
        .order("code");

    return <KioskClient branch={branch} services={services ?? []} autoPrint={autoprint === "1"} />;
}