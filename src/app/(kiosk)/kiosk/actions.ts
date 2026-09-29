"use server";

import { requireKiosk } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/form";

export type IssuedTicket = {
  id: string;
  ticket_number: string;
  created_at: string;
  priority: number;
  ahead: number;
};
export type IssueResult = { error: string } | { ticket: IssuedTicket };

export async function issueTicket(
  serviceId: string,
  isPwd: boolean,
): Promise<IssueResult> {
  await requireKiosk(); // server actions are public endpoints: always check
  if (!isUuid(serviceId)) return { error: "Invalid request." };

  // Runs as the signed-in kiosk. The database picks the branch from the account.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("kiosk_issue_ticket", {
    p_service: serviceId,
    p_is_pwd: isPwd,
  });

  const t = (Array.isArray(data) ? data[0] : data) as {
    id: string;
    ticket_number: string;
    created_at: string;
    priority: number;
  } | null;

  if (error || !t) {
    console.error("kiosk_issue_ticket failed:", error);
    return {
      error:
        "Sorry, we couldn't create your ticket. Please see the front desk.",
    };
  }

  const { data: status } = await supabase.rpc("public_ticket_status", {
    p_ticket: t.id,
  });
  const ahead = status?.[0]?.people_ahead ?? 0;

  return {
    ticket: {
      id: t.id,
      ticket_number: t.ticket_number,
      created_at: t.created_at,
      priority: t.priority,
      ahead,
    },
  };
}
