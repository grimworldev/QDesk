import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/form";

const badge: Record<string, string> = {
    active: "bg-success/10 text-success",
    inactive: "bg-muted/15 text-muted",
    suspended: "bg-danger/10 text-danger",
};

export default async function StaffListPage() {
    await requireRole(["admin"]);
    const supabase = await createClient();

    const { data: staff } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, status, roles(name), branches(name)")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-primary">Staff</h1>
                    <p className="text-sm text-muted">Manage who can sign in and what they can do.</p>
                </div>
                <Link href="/admin/staff/new" className="btn-primary">Add staff</Link>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs uppercase tracking-wide text-muted">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Branch</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {(staff ?? []).map((s) => (
                            <tr key={s.id}>
                                <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                                <td className="px-4 py-3 text-muted">{s.email}</td>
                                <td className="px-4 py-3">{one(s.roles)?.name ?? "-"}</td>
                                <td className="px-4 py-3">{one(s.branches)?.name ?? "-"}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badge[s.status] ?? ""}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/staff/${s.id}`} className="font-medium text-primary underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                        {!staff?.length && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No staff yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}