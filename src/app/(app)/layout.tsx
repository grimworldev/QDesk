import { NavLinks } from "@/components/layout/nav-links";
import { navItems } from "@/config/nav";
import { requireUser } from "@/lib/auth";

function SignOutButton({ className = "" }: { className?: string }) {
    return (
        <form action="/auth/signout" method="post">
            <button className={className}>Sign out</button>
        </form>
    );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const me = await requireUser();
    const items = navItems
        .filter((i) => i.roles.includes(me.role))
        .map(({ title, href }) => ({ title, href }));
    const name = `${me.first_name} ${me.last_name}`.trim();

    return (
        <div className="min-h-svh md:flex">
            {/* Desktop sidebar */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
                <div className="px-5 py-4 text-lg font-semibold text-slate-900">Queue System</div>
                <NavLinks items={items} className="flex flex-1 flex-col gap-1 px-3" />
                <div className="border-t border-slate-200 p-4">
                    <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                    <p className="truncate text-xs text-slate-500">{me.roleName}</p>
                    <SignOutButton className="mt-3 text-sm text-slate-600 underline hover:text-slate-900" />
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile top bar */}
                <header className="border-b border-slate-200 bg-white md:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="font-semibold text-slate-900">Queue System</span>
                        <SignOutButton className="text-sm text-slate-600 underline" />
                    </div>
                    <NavLinks items={items} className="flex gap-1 overflow-x-auto px-3 pb-3" />
                </header>

                <main className="flex-1 bg-slate-50 p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}