import path from "node:path";
import { PAGE_IDS, type PageId } from "@/content/pages";

// ============================================================
// Variáveis de ambiente do SERVIDOR. Nenhuma tem prefixo NEXT_PUBLIC_:
// o token do COMERCIAL nunca pode chegar ao browser. Lidas em RUNTIME (não
// são embutidas no build), então dá para trocar sem rebuild.
// ============================================================

export interface ServerEnv {
  /** Ex.: https://comercial.rcoacademy.com.br */
  comercialBaseUrl: string | null;
  /** Um token por página (uma integração por LP no COMERCIAL). */
  tokens: Record<PageId, string | null>;
  outboxDir: string;
  /** Origens extras aceitas em POST /api/lead (além do próprio host). */
  allowedOrigins: string[];
  sentRetentionDays: number;
}

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export function readServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  const tokens = Object.fromEntries(
    PAGE_IDS.map((id) => [id, clean(env[`COMERCIAL_LEAD_TOKEN_${id}`])]),
  ) as Record<PageId, string | null>;
  const days = Number(env.OUTBOX_SENT_RETENTION_DAYS);
  return {
    comercialBaseUrl: clean(env.COMERCIAL_BASE_URL),
    tokens,
    outboxDir: clean(env.LEAD_OUTBOX_DIR) ?? path.join(process.cwd(), ".data", "outbox"),
    allowedOrigins: (env.LEAD_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean),
    sentRetentionDays: Number.isFinite(days) && days > 0 ? days : 30,
  };
}
