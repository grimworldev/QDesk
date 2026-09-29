import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { KioskLoginForm } from "./kiosk-login-form";

export default async function KioskLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const me = await getCurrentUser();
    if (me?.role === "kiosk" && me.status === "active" && me.branch_id) redirect("/kiosk");

    const { error } = await searchParams;

    return (
        <main className="flex min-h-svh items-center justify-center p-6">
            <div className="card w-full max-w-sm space-y-6 p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-primary">Kiosk sign in</h1>
                    <p className="mt-1 text-sm text-muted">Use the kiosk account for this device.</p>
                </div>
                {error === "access" && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                        This account isn't an active kiosk account with a branch.
                    </p>
                )}
                <KioskLoginForm />
            </div>
        </main>
    );
}