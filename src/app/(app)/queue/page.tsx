import { requireUser } from "@/lib/auth";
import { one } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { LiveRefresh } from "./live-refresh";
import { QueuePanel, type TicketRow } from "./queue-panel";
import { WindowPicker } from "./window-picker";

export const dynamic = "force-dynamic";

const NO_SERVICE = "00000000-0000-0000-0000-000000000000"; // keeps .in() valid when a window has no services

type RawTicket = {
    id: string;
    ticket_number: string;
    status: string;
    priority: number;
    created_at: string;
    services: { name: string } | { name: string }[] | null;
};

export default async function QueuePage() {
    const me = await requireUser();
    const supabase = await createClient();

    if (!me.branch_id && me.role !== "admin") {
        return <p className="card p-6 text-muted">You aren't assigned to a branch yet. Ask an administrator.</p>;
    }

    let query = supabase
        .from("windows")
        .select("id, name, status, branch_id, current_staff_id, profiles!current_staff_id(first_name, last_name)")
        .eq("is_active", true)
        .order("name");
    if (me.branch_id) query = query.eq("branch_id", me.branch_id);
    const { data: windows, error } = await query;

    if (error) {
        return <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">Could not load windows: {error.message}</p>;
    }

    const mine = (windows ?? []).find(
        (w) => w.current_staff_id === me.id && (w.status === "open" || w.status === "on_break")
    );
    const branchId = mine?.branch_id ?? me.branch_id ?? windows?.[0]?.branch_id ?? null;

    /* ---- No window open yet: choose one ---- */
    if (!mine) {
        return (
            <>
                {branchId && <LiveRefresh branchId={branchId} />}
                <div className="mx-auto  space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-primary">My Window</h1>
                        <p className="text-sm text-muted">Choose the window you're working at.</p>
                    </div>
                    <WindowPicker
                        windows={(windows ?? []).map((w) => {
                            const p = one(w.profiles);
                            return {
                                id: w.id,
                                name: w.name,
                                status: w.status,
                                operator: p ? `${p.first_name} ${p.last_name}`.trim() : null,
                            };
                        })}
                    />
                </div>
            </>
        );
    }

    /* ---- Window open: load the queue ---- */
    const [{ data: branch }, { data: ws }] = await Promise.all([
        supabase.from("branches").select("timezone").eq("id", mine.branch_id).single(),
        supabase.from("window_services").select("service_id").eq("window_id", mine.id),
    ]);

    const tz = branch?.timezone ?? "Asia/Manila";
    const serviceIds = (ws ?? []).map((r) => r.service_id);
    const ids = serviceIds.length ? serviceIds : [NO_SERVICE];
    const today = new Date().toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD in the branch's timezone
    const cols = "id, ticket_number, status, priority, created_at, services!service_id(name)";

    const [currentRes, waitingRes, skippedRes] = await Promise.all([
        supabase.from("tickets").select(cols).eq("window_id", mine.id).in("status", ["called", "serving"]).limit(1),
        supabase
            .from("tickets")
            .select(cols, { count: "exact" })
            .eq("branch_id", mine.branch_id)
            .eq("ticket_date", today)
            .eq("status", "waiting")
            .in("service_id", ids)
            .order("priority", { ascending: false })
            .order("created_at", { ascending: true })
            .limit(15),
        supabase
            .from("tickets")
            .select(cols)
            .eq("branch_id", mine.branch_id)
            .eq("ticket_date", today)
            .eq("status", "skipped")
            .in("service_id", ids)
            .order("created_at", { ascending: true })
            .limit(15),
    ]);

    // Formatted on the server so the text is identical when the page hydrates
    const toRow = (t: RawTicket): TicketRow => ({
        id: t.id,
        ticket_number: t.ticket_number,
        priority: t.priority,
        status: t.status,
        service_name: one(t.services)?.name ?? "",
        time: new Date(t.created_at).toLocaleTimeString("en-PH", { timeZone: tz, hour: "numeric", minute: "2-digit" }),
    });

    return (
        <>
            <LiveRefresh branchId={mine.branch_id} />
            <QueuePanel
                win={{ id: mine.id, name: mine.name, status: mine.status }}
                current={currentRes.data?.[0] ? toRow(currentRes.data[0]) : null}
                waiting={(waitingRes.data ?? []).map(toRow)}
                waitingCount={waitingRes.count ?? 0}
                skipped={(skippedRes.data ?? []).map(toRow)}
                noServices={serviceIds.length === 0}
            />
        </>
    );
}