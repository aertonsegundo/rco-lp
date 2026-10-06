import { after } from "next/server";
import { handleLeadRequest } from "@/lib/lead-service";
import { getRuntime } from "@/lib/runtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rt = getRuntime();
  return handleLeadRequest(request, {
    outbox: rt.outbox,
    send: rt.send,
    allowedOrigins: rt.env.allowedOrigins,
    rateIp: rt.rateIp,
    ratePhone: rt.ratePhone,
    recentByPhone: rt.recentByPhone,
    log: rt.log,
    schedule: (task) => after(task),
  });
}
