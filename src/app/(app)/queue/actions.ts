"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/form";

export type QueueResult = { error?: string; info?: string };

function done(error: { message: string } | null): QueueResult {
  if (error) return { error: error.message };
  revalidatePath("/queue");
  return {};
}

export async function setWindowStatus(
  windowId: string,
  status: "open" | "on_break" | "closed",
): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(windowId)) return { error: "Invalid window." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_window_status", {
    p_window: windowId,
    p_status: status,
  });
  return done(error);
}

export async function callNext(windowId: string): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(windowId)) return { error: "Invalid window." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("call_next_ticket", {
    p_window: windowId,
  });
  if (error) return { error: error.message };
  const t = Array.isArray(data) ? data[0] : data;
  revalidatePath("/queue");
  if (!t?.id) return { info: "No one is waiting for this window's services." };
  return {};
}

export async function startServing(ticketId: string): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(ticketId)) return { error: "Invalid ticket." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("start_serving", { p_ticket: ticketId });
  return done(error);
}

export async function completeTicket(ticketId: string): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(ticketId)) return { error: "Invalid ticket." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_ticket", {
    p_ticket: ticketId,
  });
  return done(error);
}

export async function skipTicket(ticketId: string): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(ticketId)) return { error: "Invalid ticket." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("skip_ticket", { p_ticket: ticketId });
  return done(error);
}

export async function noShowTicket(ticketId: string): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(ticketId)) return { error: "Invalid ticket." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("no_show_ticket", {
    p_ticket: ticketId,
  });
  return done(error);
}

/** windowId is only needed to bring a SKIPPED ticket back to your window */
export async function recallTicket(
  ticketId: string,
  windowId?: string,
): Promise<QueueResult> {
  await requireUser();
  if (!isUuid(ticketId)) return { error: "Invalid ticket." };
  if (windowId && !isUuid(windowId)) return { error: "Invalid window." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("recall_ticket", {
    p_ticket: ticketId,
    p_window: windowId,
  });
  return done(error);
}
