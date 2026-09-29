"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await createClient().auth.signInWithPassword({ email, password });

        if (error) {
            setError("Invalid email or password.");
            setLoading(false);
            return;
        }
        router.replace("/dashboard");
        router.refresh();
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4 text-left">
            {error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <div>
                <label className="label">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </div>
            <div>
                <label className="label">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            </div>
            <button disabled={loading} className="btn-primary w-full">
                {loading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
}