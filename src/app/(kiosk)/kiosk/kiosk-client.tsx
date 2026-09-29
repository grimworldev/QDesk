"use client";
import { useEffect, useState, useTransition } from "react";
import { issueTicket, type IssuedTicket } from "./actions";

type Branch = { id: string; name: string; code: string; timezone: string };
type Service = { id: string; name: string; code: string; description: string | null };

const RESET_SECONDS = 15;

export function KioskClient({
    branch,
    services,
    autoPrint,
}: {
    branch: Branch;
    services: Service[];
    autoPrint: boolean;
}) {
    const [pwd, setPwd] = useState(false);
    const [issued, setIssued] = useState<{ ticket: IssuedTicket; service: Service } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function take(service: Service) {
        setError(null);
        startTransition(async () => {
            const res = await issueTicket(service.id, pwd);
            if ("error" in res) {
                setError(res.error);
                return;
            }
            setIssued({ ticket: res.ticket, service });
            setPwd(false);
        });
    }

    // Print automatically (only when the URL has ?autoprint=1, i.e. on the real kiosk)
    useEffect(() => {
        if (issued && autoPrint) window.print();
    }, [issued, autoPrint]);

    // Return to the service list after a while, ready for the next customer
    useEffect(() => {
        if (!issued) return;
        const timer = setTimeout(() => setIssued(null), RESET_SECONDS * 1000);
        return () => clearTimeout(timer);
    }, [issued]);

    /* ---------- Ticket screen (this card is also the printed receipt) ---------- */
    if (issued) {
        const { ticket, service } = issued;
        const when = new Date(ticket.created_at).toLocaleString("en-PH", {
            timeZone: branch.timezone,
            dateStyle: "medium",
            timeStyle: "short",
        });

        return (
            <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
                <div className="receipt card w-full max-w-sm p-8 text-center">
                    <p className="text-sm font-medium uppercase tracking-widest text-muted">{branch.name}</p>
                    <p className="mt-4 text-sm text-muted">Your number</p>
                    <p className="my-2 font-mono text-7xl font-bold text-accent">{ticket.ticket_number}</p>
                    {ticket.priority === 1 && (
                        <p className="print-badge inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                            PRIORITY (PWD)
                        </p>
                    )}
                    <p className="mt-4 text-lg font-medium">{service.name}</p>
                    <p className="text-sm text-muted">{when}</p>
                    <p className="mt-4 text-sm">
                        {ticket.ahead === 0 ? "You're next in line." : `${ticket.ahead} ahead of you.`}
                    </p>
                    <p className="mt-4 text-xs text-muted">Please wait for your number to be called.</p>
                </div>

                <div className="flex gap-3">
                    <button className="btn-outline" onClick={() => window.print()}>Print ticket</button>
                    <button className="btn-primary" onClick={() => setIssued(null)}>Done</button>
                </div>
                <p className="text-xs text-muted">This screen resets automatically.</p>
            </main>
        );
    }

    /* ---------- Service selection ---------- */
    return (
        <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 p-6">
            <header className="text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-muted">{branch.name}</p>
                <h1 className="mt-2 text-4xl font-semibold text-primary">Welcome</h1>
                <p className="mt-1 text-muted">Tap a service to get your queue number</p>
            </header>

            <label className="card flex cursor-pointer items-center gap-4 p-5">
                <input
                    type="checkbox"
                    checked={pwd}
                    onChange={(e) => setPwd(e.target.checked)}
                    className="size-6 shrink-0"
                />
                <span>
                    <span className="block font-medium">Priority lane (PWD)</span>
                    <span className="block text-sm text-muted">
                        Tick this before choosing a service. Please show your ID at the window.
                    </span>
                </span>
            </label>

            {error && (
                <p className="rounded-lg bg-danger/10 px-4 py-3 text-center text-danger">{error}</p>
            )}

            {services.length === 0 ? (
                <p className="text-center text-muted">No services are available. Please see the front desk.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {services.map((s) => (
                        <button
                            key={s.id}
                            disabled={pending}
                            onClick={() => take(s)}
                            className="card p-6 text-left transition hover:border-primary active:scale-[0.99] disabled:opacity-60"
                        >
                            <span className="font-mono text-sm font-semibold text-accent-700">{s.code}</span>
                            <span className="mt-1 block text-2xl font-semibold text-primary">{s.name}</span>
                            {s.description && <span className="mt-1 block text-sm text-muted">{s.description}</span>}
                        </button>
                    ))}
                </div>
            )}

            {pending && <p className="text-center text-sm text-muted">Creating your ticket...</p>}
        </main>
    );
}