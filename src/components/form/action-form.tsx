"use client";
import Link from "next/link";
import { startTransition, useActionState } from "react";
import type { ActionState } from "@/lib/form";

type Props = {
    action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
    submitLabel: string;
    cancelHref?: string;
    children: React.ReactNode;
};

export function ActionForm({ action, submitLabel, cancelHref, children }: Props) {
    const [state, formAction, pending] = useActionState(action, null);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                startTransition(() => formAction(data));
            }}
            className="space-y-5"
        >
            {state?.error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
            )}
            {state?.success && (
                <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.success}</p>
            )}

            {children}

            <div className="flex gap-3 pt-2">
                <button disabled={pending} className="btn-primary">
                    {pending ? "Saving..." : submitLabel}
                </button>
                {cancelHref && (
                    <Link href={cancelHref} className="btn-outline">
                        Cancel
                    </Link>
                )}
            </div>
        </form>
    );
}