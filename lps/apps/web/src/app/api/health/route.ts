import { getRuntime } from "@/lib/runtime";

export const dynamic = "force-dynamic";

/**
 * Saúde para monitoramento. Só expõe contagens e booleanos: nada de
 * nome, telefone, token nem URL.
 *   attention > 0  → há lead falho ou enviado com aviso; alguém precisa olhar.
 *   pending antigo → o COMERCIAL pode estar fora do ar.
 */
export async function GET() {
  const rt = getRuntime();
  const counts = rt.outbox.counts();
  const oldest = rt.outbox.oldestPendingAgeMs(new Date());
  return Response.json(
    {
      ok: true,
      outbox: { ...counts, oldestPendingSec: oldest === null ? null : Math.round(oldest / 1000) },
      configured: {
        comercial: Boolean(rt.env.comercialBaseUrl),
        tokens: Object.fromEntries(Object.entries(rt.env.tokens).map(([k, v]) => [k, Boolean(v)])),
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
