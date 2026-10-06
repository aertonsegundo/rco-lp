import { sanitizeTracking, trackingFromSearchParams, type Tracking } from "@rco/lead-core/tracking";

// UTM / gclid / fbclid da URL de entrada, guardados na SESSÃO do navegador
// (some ao fechar a aba). Escolha conservadora: cookie ou localStorage
// persistente guardaria por mais tempo, mas a decisão de por quanto tempo
// rastrear é da RCO — se um dia quiser atribuição de retorno (pessoa que sai
// e volta em outro dia), trocar aqui.

const KEY = "rco_tracking_v1";

/** Se a URL traz parâmetros de campanha, guarda; senão mantém o que já tinha. */
export function captureTracking(): void {
  try {
    const fromUrl = trackingFromSearchParams(new URLSearchParams(window.location.search));
    if (Object.keys(fromUrl).length > 0) sessionStorage.setItem(KEY, JSON.stringify(fromUrl));
  } catch {
    // sessionStorage bloqueado (modo privado, política do navegador): segue sem
  }
}

export function readTracking(): Tracking {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? sanitizeTracking(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}
