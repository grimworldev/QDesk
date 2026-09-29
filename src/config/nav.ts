import type { RoleCode } from "@/lib/auth";

export type NavItem = { title: string; href: string; roles: RoleCode[] };

const all: RoleCode[] = ["admin", "supervisor", "staff"];

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", roles: all },
  { title: "My Window", href: "/queue", roles: all },
  { title: "Reports", href: "/admin/reports", roles: ["admin", "supervisor"] },
  { title: "Staff", href: "/admin/staff", roles: ["admin"] },
  { title: "Services", href: "/admin/services", roles: ["admin"] },
  { title: "Windows", href: "/admin/windows", roles: ["admin"] },
  { title: "Branches", href: "/admin/branches", roles: ["admin"] },
];
