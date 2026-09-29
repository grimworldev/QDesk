import type { Database } from "@/types/database";

export type ActionState = { error?: string; success?: string } | null;

export type UserStatus = Database["public"]["Enums"]["user_status"];
export const USER_STATUSES: readonly UserStatus[] = [
  "active",
  "inactive",
  "suspended",
];

/** Read a trimmed string from a form */
export const str = (fd: FormData, key: string) =>
  String(fd.get(key) ?? "").trim();

/** Same, but empty becomes null (for optional columns) */
export const optStr = (fd: FormData, key: string) => str(fd, key) || null;

export const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Supabase joins can come back as an object or a one-item array. This handles both. */
export const one = <T>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
