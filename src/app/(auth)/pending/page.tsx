import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function PendingPage() {
    const me = await getCurrentUser();
    if (!me) redirect("/login");
    if (me.status === "active") redirect("/dashboard");

    return (
        <div className="space-y-6 text-center">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Waiting for approval</h1>
                <p className="mt-2 text-sm text-slate-500">
                    <span className="font-medium">{me.email}</span> isn't active yet. Ask an
                    administrator to invite this email.
                </p>
            </div>
            <form action="/auth/signout" method="post">
                <button className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Sign out
                </button>
            </form>
        </div>
    );
}