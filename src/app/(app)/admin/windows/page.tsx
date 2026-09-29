import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { one } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
    open: "bg-success/10 text-success",
    on_break: "bg-warning/10 text-warning",
    closed: "bg-muted/15 text-muted",
};
const statusLabel: Record<string, string> = { open: "Open", on_break: "On break", closed: "Closed" };

export default async function WindowsPage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const [{ data: windows, error }, { data: services }] = await Promise.all([
        supabase
            .from("windows")
            .select(
                "id, name, status, is_active, branches!branch_id(name), profiles!current_staff_id(first_name, last_name), window_services(service_id)"
            )
            .order("name"),
        supabase.from("services").select("id, code"),
    ]);

    if (error) console.error("windows query failed:", error);
    const codeOf = new Map((services ?? []).map((s) => [s.id, s.code]));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-primary">Windows</h1>
                    <p className="text-sm text-muted">Counters where staff serve customers.</p>
                </div>
                <Link href="/admin/windows/new" className="btn-primary">Add window</Link>
            </div>

            {error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                    Could not load windows: {error.message}
                </p>
            )}

            <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs uppercase tracking-wide text-muted">
                        <tr>
                            <th className="px-4 py-3">Window</th>
                            <th className="px-4 py-3">Branch</th>
                            <th className="px-4 py-3">Services</th>
                            <th className="px-4 py-3">Now</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {(windows ?? []).map((w) => {
                            const operator = one(w.profiles);
                            return (
                                <tr key={w.id} className={w.is_active ? "" : "opacity-60"}>
                                    <td className="px-4 py-3 font-medium">
                                        {w.name}
                                        {!w.is_active && (
                                            <span className="ml-2 rounded-full bg-muted/15 px-2 py-0.5 text-xs text-muted">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted">{one(w.branches)?.name ?? "-"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {w.window_services.map((ws) => (
                                                <span
                                                    key={ws.service_id}
                                                    className="rounded-md bg-accent-100 px-2 py-0.5 font-mono text-xs font-semibold text-accent-700"
                                                >
                                                    {codeOf.get(ws.service_id) ?? "?"}
                                                </span>
                                            ))}
                                            {w.window_services.length === 0 && <span className="text-muted">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[w.status] ?? ""}`}>
                                            {statusLabel[w.status] ?? w.status}
                                        </span>
                                        {operator && (
                                            <span className="ml-2 text-xs text-muted">
                                                {operator.first_name} {operator.last_name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/windows/${w.id}`} className="font-medium text-primary underline">Edit</Link>
                                    </td>
                                </tr>
                            );
                        })}
                        {!windows?.length && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted">No windows yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}