"use client";
import { useState, useTransition } from "react";
import { setWindowStatus } from "./actions";

export type PickerWindow = { id: string; name: string; status: string; operator: string | null };

export function WindowPicker({ windows }: { windows: PickerWindow[] }) {
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function open(id: string) {
        setError(null);
        start(async () => {
            const r = await setWindowStatus(id, "open");
            if (r.error) setError(r.error);
        });
    }

    return (
        <div className="space-y-3">
            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            {windows.map((w) => {
                const free = w.status === "closed";
                return (
                    <div key={w.id} className="card flex items-center justify-between gap-4 p-5">
                        <div>
                            <p className="text-lg font-semibold">{w.name}</p>
                            <p className="text-sm text-muted">
                                {free ? "Available" : `In use${w.operator ? ` by ${w.operator}` : ""}`}
                            </p>
                        </div>
                        <button disabled={!free || pending} onClick={() => open(w.id)} className="btn-primary">
                            {free ? "Open this window" : "Taken"}
                        </button>
                    </div>
                );
            })}
            {windows.length === 0 && (
                <p className="card p-6 text-center text-muted">
                    There are no windows in your branch yet. Ask an administrator to add some.
                </p>
            )}
        </div>
    );
}