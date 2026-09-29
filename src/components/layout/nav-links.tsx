"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { title: string; href: string };

export function NavLinks({ items, className = "" }: { items: NavLink[]; className?: string }) {
    const pathname = usePathname();

    return (
        <nav className={className}>
            {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted hover:bg-primary-50 hover:text-primary"
                            }`}
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}