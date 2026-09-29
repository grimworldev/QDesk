import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
    const me = await getCurrentUser();
    if (me) redirect(me.status === "active" ? "/dashboard" : "/pending");

    return (
        <div className="space-y-6 text-center">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Queue System</h1>
                <p className="mt-1 text-sm text-slate-500">Staff sign in</p>
            </div>

            <LoginForm />

            <p className="text-sm text-slate-500">
                No account?{" "}
                <Link href="/register" className="font-medium text-slate-900 underline">
                    Create one
                </Link>
            </p>
        </div>
    );
}