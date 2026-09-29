"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LiveRefresh({ branchId }: { branchId: string }) {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        let timer: ReturnType<typeof setTimeout> | null = null;

        const refresh = () => {
            if (timer) return; // batch bursts of changes into one refresh
            timer = setTimeout(() => {
                timer = null;
                router.refresh();
            }, 400);
        };

        const channel = supabase
            .channel(`queue-${branchId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "tickets", filter: `branch_id=eq.${branchId}` },
                refresh
            )
            .subscribe();

        const poll = setInterval(() => router.refresh(), 10000);

        return () => {
            clearInterval(poll);
            if (timer) clearTimeout(timer);
            supabase.removeChannel(channel);
        };
    }, [branchId, router]);

    return null;
}