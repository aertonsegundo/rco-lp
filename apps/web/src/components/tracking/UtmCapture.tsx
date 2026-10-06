"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureTracking } from "@/lib/tracking/utms";
import { gtmPush } from "@/lib/tracking/events";

/** Guarda os parâmetros de campanha da entrada e marca a visualização. */
export function UtmCapture() {
  const pathname = usePathname();
  useEffect(() => {
    captureTracking();
    gtmPush("lp_view", { page_path: pathname });
  }, [pathname]);
  return null;
}
