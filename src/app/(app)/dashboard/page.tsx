import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
    const me = await requireUser(); // cached, so no extra query
    return (
        <div>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome, {me.first_name}</h1>
            <p className="mt-1 text-slate-500">Signed in as {me.roleName}.</p>
        </div>
    );
}