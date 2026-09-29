"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ first: "", last: "", email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [k]: e.target.value });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await createClient().auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { first_name: form.first, last_name: form.last } },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }
        if (!data.session) {
            // Happens only if "Confirm email" is still ON in Supabase
            setError("Account created, but email confirmation is still enabled in Supabase.");
            setLoading(false);
            return;
        }
        router.replace("/dashboard");
        router.refresh();
    }

    const input =
        "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900";

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-slate-900">Create demo account</h1>
                <p className="mt-1 text-sm text-slate-500">Try the queue system</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="First name" value={form.first} onChange={set("first")} className={input} />
                    <input required placeholder="Last name" value={form.last} onChange={set("last")} className={input} />
                </div>
                <input type="email" required placeholder="Email" value={form.email} onChange={set("email")} className={input} />
                <input type="password" required minLength={8} placeholder="Password (min 8 characters)" value={form.password} onChange={set("password")} className={input} />
                <button
                    disabled={loading}
                    className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                    {loading ? "Creating..." : "Create account"}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-slate-900 underline">Sign in</Link>
            </p>
        </div>
    );
}