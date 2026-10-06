// Eventos de conversão. Vão para o dataLayer (GTM) e, se o Pixel estiver
// carregado, para o Meta. Sem GTM/Pixel configurados, o dataLayer existe e
// simplesmente ninguém escuta: nada quebra.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function gtmPush(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

export const trackEvent = gtmPush;

/**
 * Lead enviado com sucesso. `eventId` é o mesmo `respondent_id` que foi ao
 * COMERCIAL: serve para deduplicar com um evento de servidor (CAPI) no futuro.
 */
export function trackLead(page: string, eventId: string): void {
  gtmPush("lp_lead", { page, event_id: eventId });
  window.fbq?.("track", "Lead", { content_name: page }, { eventID: eventId });
}

/** UUID v4. Cai para getRandomValues em navegador sem randomUUID (contexto não seguro). */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
