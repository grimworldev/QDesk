"use client";
import { useState, useTransition } from "react";
import {
    callNext, completeTicket, noShowTicket, recallTicket,
    setWindowStatus, skipTicket, startServing, type QueueResult,
} from "./actions";

export type TicketRow = {
    id: string;
    ticket_number: string;
    priority: number;
    service_name: string;
    time: string;
    status: string;
};

type Props = {
    win: { id: string; name: string; status: string };
    current: TicketRow | null;
    waiting: TicketRow[];
    waitingCount: number;
    skipped: TicketRow[];
    noServices: boolean;
};

const Pwd = () => (
    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">PWD</span>
);

export function QueuePanel({ win, current, waiting, waitingCount, skipped, noServices }: Props) {
    const [pending, start] = useTransition();
    const [notice, setNotice] = useState<{ type: "error" | "info"; text: string } | null>(null);

    function run(fn: () => Promise<QueueResult>) {
        setNotice(null);
        start(async () => {
            const r = await fn();
            if (r.error) setNotice({ type: "error", text: r.error });
            else if (r.info) setNotice({ type: "info", text: r.info });
        });
    }

    const onBreak = win.status === "on_break";
    const big = "px-8 py-4 text-lg";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-primary">{win.name}</h1>
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${onBreak ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                            }`}
                    >
                        {onBreak ? "On break" : "Open"}
                    </span>
                </div>
                <div className="flex gap-2">
                    {onBreak ? (
                        <button disabled={pending} className="btn-primary" onClick={() => run(() => setWindowStatus(win.id, "open"))}>
                            Resume
                        </button>
                    ) : (
                        <button
                            disabled={pending || !!current}
                            className="btn-outline"
                            onClick={() => run(() => setWindowStatus(win.id, "on_break"))}
                        >
                            Break
                        </button>
                    )}
                    <button
                        disabled={pending || !!current}
                        className="btn-outline"
                        onClick={() => run(() => setWindowStatus(win.id, "closed"))}
                    >
                        Close window
                    </button>
                </div>
            </div>

            {notice && (
                <p
                    className={`rounded-lg px-4 py-3 text-sm ${notice.type === "error" ? "bg-danger/10 text-danger" : "bg-primary-50 text-primary"
                        }`}
                >
                    {notice.text}
                </p>
            )}

            {noServices && (
                <p className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
                    This window has no services assigned. Ask an administrator to edit it.
                </p>
            )}

            {/* Now serving / call next */}
            <div className="card p-8 text-center">
                {onBreak ? (
                    <>
                        <p className="text-xl font-semibold">You're on break</p>
                        <p className="mt-1 text-muted">Press Resume when you're ready to call customers.</p>
                    </>
                ) : current ? (
                    <>
                        <p className="text-sm uppercase tracking-widest text-muted">
                            {current.status === "serving" ? "Now serving" : "Called, waiting for customer"}
                        </p>
                        <p className="my-3 font-mono text-8xl font-bold text-accent">{current.ticket_number}</p>
                        <div className="flex items-center justify-center gap-2">
                            {current.priority === 1 && <Pwd />}
                            <span className="font-medium">{current.service_name}</span>
                            <span className="text-sm text-muted">· taken {current.time}</span>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {current.status === "called" ? (
                                <>
                                    <button disabled={pending} className={`btn-primary ${big}`} onClick={() => run(() => startServing(current.id))}>
                                        Start serving
                                    </button>
                                    <button disabled={pending} className="btn-outline" onClick={() => run(() => recallTicket(current.id))}>
                                        Call again
                                    </button>
                                    <button disabled={pending} className="btn-outline" onClick={() => run(() => skipTicket(current.id))}>
                                        Skip
                                    </button>
                                    <button
                                        disabled={pending}
                                        className="btn-outline text-danger"
                                        onClick={() => {
                                            if (confirm(`Mark ${current.ticket_number} as no-show? This ends the ticket.`)) {
                                                run(() => noShowTicket(current.id));
                                            }
                                        }}
                                    >
                                        No-show
                                    </button>
                                </>
                            ) : (
                                <button disabled={pending} className={`btn-primary ${big}`} onClick={() => run(() => completeTicket(current.id))}>
                                    Complete
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm uppercase tracking-widest text-muted">Ready</p>
                        <p className="my-3 text-2xl font-semibold text-primary">
                            {waitingCount === 0 ? "No one is waiting" : `${waitingCount} waiting`}
                        </p>
                        <button
                            disabled={pending || waitingCount === 0}
                            className={`btn-primary ${big}`}
                            onClick={() => run(() => callNext(win.id))}
                        >
                            {pending ? "Calling..." : "Call next"}
                        </button>
                    </>
                )}
            </div>

            {/* Lists */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="card overflow-hidden lg:col-span-2">
                    <div className="border-b px-5 py-3">
                        <h2 className="font-semibold">Waiting ({waitingCount})</h2>
                        <p className="text-xs text-muted">PWD first, then in order of arrival.</p>
                    </div>
                    <ul className="divide-y">
                        {waiting.map((t, i) => (
                            <li key={t.id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-accent-50" : ""}`}>
                                <span className="w-20 font-mono text-lg font-semibold">{t.ticket_number}</span>
                                {t.priority === 1 && <Pwd />}
                                <span className="flex-1 text-sm text-muted">{t.service_name}</span>
                                {i === 0 && <span className="text-xs font-medium text-accent-700">Next</span>}
                                <span className="text-sm text-muted">{t.time}</span>
                            </li>
                        ))}
                        {waiting.length === 0 && <li className="px-5 py-8 text-center text-muted">Nobody in line.</li>}
                    </ul>
                    {waitingCount > waiting.length && (
                        <p className="border-t px-5 py-2 text-xs text-muted">
                            Showing the first {waiting.length} of {waitingCount}.
                        </p>
                    )}
                </div>

                <div className="card overflow-hidden">
                    <div className="border-b px-5 py-3">
                        <h2 className="font-semibold">Skipped ({skipped.length})</h2>
                        <p className="text-xs text-muted">Customers who weren't there when called.</p>
                    </div>
                    <ul className="divide-y">
                        {skipped.map((t) => (
                            <li key={t.id} className="flex items-center gap-2 px-5 py-3">
                                <span className="font-mono font-semibold">{t.ticket_number}</span>
                                {t.priority === 1 && <Pwd />}
                                <span className="flex-1" />
                                <button
                                    disabled={pending || !!current || onBreak}
                                    title={current ? "Finish your current ticket first" : "Call this ticket again"}
                                    className="btn-outline px-3 py-1.5"
                                    onClick={() => run(() => recallTicket(t.id, win.id))}
                                >
                                    Call
                                </button>
                                <button
                                    disabled={pending}
                                    className="btn-outline px-3 py-1.5 text-danger"
                                    onClick={() => {
                                        if (confirm(`Mark ${t.ticket_number} as no-show? This ends the ticket.`)) {
                                            run(() => noShowTicket(t.id));
                                        }
                                    }}
                                >
                                    No-show
                                </button>
                            </li>
                        ))}
                        {skipped.length === 0 && <li className="px-5 py-8 text-center text-muted">None.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}