import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { one } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";

export default async function ServicesPage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: services, error } = await supabase
        .from("services")
        .select("id, name, code, description, is_active, branches!branch_id(name)")
        .order("code");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-primary">Services</h1>
                    <p className="text-sm text-muted">The transactions customers can line up for.</p>
                </div>
                <Link href="/admin/services/new" className="btn-primary">Add service</Link>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs uppercase tracking-wide text-muted">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Branch</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {(services ?? []).map((s) => (
                            <tr key={s.id} className={s.is_active ? "" : "opacity-60"}>
                                <td className="px-4 py-3">
                                    <span className="rounded-md bg-accent-100 px-2 py-1 font-mono text-xs font-semibold text-accent-700">
                                        {s.code}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {s.name}
                                    {!s.is_active && (
                                        <span className="ml-2 rounded-full bg-muted/15 px-2 py-0.5 text-xs text-muted">Hidden</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-muted">{one(s.branches)?.name ?? "-"}</td>
                                <td className="px-4 py-3 text-muted">{s.description ?? "-"}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/services/${s.id}`} className="font-medium text-primary underline">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {!services?.length && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted">No services yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}