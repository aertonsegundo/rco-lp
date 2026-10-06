import path from "node:path";
import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança básicos. SEM Content-Security-Policy por enquanto:
 * GTM, Pixel e o player de vídeo (Panda/Vimeo) ainda não foram escolhidos, e
 * a CSP certa depende deles. Definir a CSP junto com a publicação.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Imagem enxuta para o Docker (usado na publicação, que fica pro fim).
  output: "standalone",
  // Monorepo: o rastreamento do standalone precisa enxergar packages/*.
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  transpilePackages: ["@rco/lead-core"],
  poweredByHeader: false,
  // Só vale em `next dev`: sem isso, o Next bloqueia os recursos internos
  // (o que liga o JavaScript da página, incluindo o HMR) quando o acesso
  // vem de um IP da rede local em vez de "localhost" — testar pelo celular
  // carregava a página, mas nenhum efeito de JavaScript rodava (nem o
  // carrossel da seção 2, nem as linhas do diagrama). Rede doméstica/do
  // escritório do usuário, IP pode mudar se o roteador reatribuir — se
  // parar de funcionar de novo, é só o IP ter mudado, atualiza aqui.
  allowedDevOrigins: ["192.168.1.20"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
