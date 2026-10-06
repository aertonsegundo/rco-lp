import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("libera até o limite e depois bloqueia com Retry-After", () => {
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const t0 = 1_000_000;
    expect(rl.check("ip", t0).ok).toBe(true);
    expect(rl.check("ip", t0 + 1000).ok).toBe(true);
    expect(rl.check("ip", t0 + 2000).ok).toBe(true);
    const r = rl.check("ip", t0 + 3000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterSec).toBe(57);
  });
  it("chaves diferentes não se afetam", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(rl.check("a", 0).ok).toBe(true);
    expect(rl.check("b", 0).ok).toBe(true);
    expect(rl.check("a", 1).ok).toBe(false);
  });
  it("a janela desliza: depois do tempo volta a liberar", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(rl.check("a", 0).ok).toBe(true);
    expect(rl.check("a", 500).ok).toBe(false);
    expect(rl.check("a", 1500).ok).toBe(true);
  });
});
