import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const count = (v: { count: number }[] | null) => v?.[0]?.count ?? 0;

export default async function BranchesPage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: branches, error } = await supabase
        .from("branches")
        .select("id, name, code, address, timezone, is_active, services!branch_id(count), windows!branch_id(count)")
        .order("name");

    if (error) console.error("branches query failed:", error);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-primary">Branches</h1>
                    <p className="text-sm text-muted">Offices or locations that run their own queue.</p>
                </div>
                <Link href="/admin/branches/new" className="btn-primary">Add branch</Link>
            </div>

            {error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                    Could not load branches: {error.message}
                </p>
            )}

            <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs uppercase tracking-wide text-muted">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Address</th>
                            <th className="px-4 py-3">Timezone</th>
                            <th className="px-4 py-3">Services</th>
                            <th className="px-4 py-3">Windows</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {(branches ?? []).map((b) => (
                            <tr key={b.id} className={b.is_active ? "" : "opacity-60"}>
                                <td className="px-4 py-3">
                                    <span className="rounded-md bg-accent-100 px-2 py-1 font-mono text-xs font-semibold text-accent-700">
                                        {b.code}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{b.name}</td>
                                <td className="px-4 py-3 text-muted">{b.address ?? "-"}</td>
                                <td className="px-4 py-3 text-muted">{b.timezone}</td>
                                <td className="px-4 py-3">{count(b.services)}</td>
                                <td className="px-4 py-3">{count(b.windows)}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${b.is_active ? "bg-success/10 text-success" : "bg-muted/15 text-muted"
                                            }`}
                                    >
                                        {b.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/branches/${b.id}`} className="font-medium text-primary underline">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {!branches?.length && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted">No branches yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}