"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keep a server-rendered page current while the thing it shows is still moving.
 *
 * A task a Spark run is working on changes every few seconds, and a page that
 * showed it as it was when opened would be showing something that is no longer
 * true. Refreshes only while `active`; once the work settles, it stops asking.
 */
export function LiveRefresh({ active, everyMs = 1_500 }: { active: boolean; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(timer);
  }, [active, everyMs, router]);
  return null;
}
