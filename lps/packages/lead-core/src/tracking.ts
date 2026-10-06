// ============================================================
// Rastreamento de campanha capturado na URL de entrada. Vira campo
// personalizado no COMERCIAL-RCO (NÃO alimenta a atribuição nativa dele:
// links /go/<code>, Google Ads offline, Meta CAPI).
// ============================================================

/** Chaves aceitas. Os nomes batem com as perguntas mapeadas no COMERCIAL. */
export const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "wbraid",
  "gbraid",
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];
export type Tracking = Partial<Record<TrackingKey, string>>;

const MAX_LEN = 512;

/** Remove caracteres de controle e espaços das pontas; corta em MAX_LEN. */
export function cleanText(value: string, max = MAX_LEN): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Aceita qualquer objeto vindo do cliente e devolve só as chaves
 * conhecidas, como texto limpo e não vazio. Nunca lança: dado de
 * rastreamento inválido é descartado, não motivo pra perder o lead.
 */
export function sanitizeTracking(input: unknown): Tracking {
  if (!input || typeof input !== "object") return {};
  const src = input as Record<string, unknown>;
  const out: Tracking = {};
  for (const key of TRACKING_KEYS) {
    const raw = src[key];
    if (typeof raw !== "string") continue;
    const clean = cleanText(raw);
    if (clean) out[key] = clean;
  }
  return out;
}

/** Lê as chaves conhecidas de uma query string. */
export function trackingFromSearchParams(params: URLSearchParams): Tracking {
  const out: Tracking = {};
  for (const key of TRACKING_KEYS) {
    const raw = params.get(key);
    if (raw) {
      const clean = cleanText(raw);
      if (clean) out[key] = clean;
    }
  }
  return out;
}
