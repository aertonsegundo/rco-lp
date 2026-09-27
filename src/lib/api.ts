/**
 * Fronteira com o backend: a RPC capturar_lead_performance_rco (migration 001).
 * "saved" só existe quando o servidor responde ok — qualquer outra coisa é falha visível.
 */
import type { Attribution } from "./attribution";

export interface LeadPayload extends Attribution {
  submission_id: string;
  full_name: string;
  whatsapp: string;
  whatsapp_confirmation_status: "confirmado_visualmente";
  niche: string;
  niche_other: string | null;
  revenue_range: string;
  landing_page_version: string;
  /** Armadilha anti-spam (campo escondido). Pessoa real deixa vazio. */
  website: string;
}

export type SendResult =
  | { kind: "saved"; leadId: string; duplicate: boolean }
  | { kind: "rejected"; error: string; field?: string }
  | { kind: "failed"; reason: "config" | "network" | "timeout" | "http" | "unexpected" };

export interface ApiConfig {
  url: string;
  anonKey: string;
  rpc: string;
  timeoutMs: number;
}

export async function sendLead(
  payload: LeadPayload,
  cfg: ApiConfig,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<SendResult> {
  if (!cfg.url || !cfg.anonKey) return { kind: "failed", reason: "config" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  let res: Response;
  try {
    res = await fetchImpl(`${cfg.url}/rest/v1/rpc/${cfg.rpc}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
      },
      body: JSON.stringify({ payload }),
      signal: controller.signal,
    });
  } catch {
    return { kind: "failed", reason: controller.signal.aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) return { kind: "failed", reason: "http" };
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { kind: "failed", reason: "unexpected" };
  }
  const r = body as { ok?: unknown; lead_id?: unknown; duplicate?: unknown; error?: unknown; field?: unknown };
  if (r?.ok === true && typeof r.lead_id === "string") {
    return { kind: "saved", leadId: r.lead_id, duplicate: r.duplicate === true };
  }
  if (r?.ok === false && typeof r.error === "string") {
    return { kind: "rejected", error: r.error, field: typeof r.field === "string" ? r.field : undefined };
  }
  return { kind: "failed", reason: "unexpected" };
}
