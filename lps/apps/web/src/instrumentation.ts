// Roda uma vez quando o servidor sobe. Liga o worker que reenvia leads
// pendentes ao COMERCIAL. Só no runtime Node (usa arquivos e rede).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startWorkerOnce } = await import("./lib/runtime");
    startWorkerOnce();
  }
}
