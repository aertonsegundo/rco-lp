// Limite por chave em janela deslizante, em memória. Vale por processo: com
// UM container (o caso) é exato; com vários vira "por instância".
// É proteção de spam simples, não segurança forte.

export interface RateLimiter {
  check(key: string, now?: number): { ok: true } | { ok: false; retryAfterSec: number };
}

export function createRateLimiter(opts: { limit: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  let lastSweep = 0;
  return {
    check(key, now = Date.now()) {
      if (now - lastSweep > opts.windowMs) {
        lastSweep = now;
        for (const [k, arr] of hits) {
          if (arr.every((t) => now - t >= opts.windowMs)) hits.delete(k);
        }
      }
      const recent = (hits.get(key) ?? []).filter((t) => now - t < opts.windowMs);
      if (recent.length >= opts.limit) {
        const oldest = recent[0] ?? now;
        hits.set(key, recent);
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000)) };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true };
    },
  };
}
