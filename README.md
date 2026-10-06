# RCO · landing pages

Monorepo das landing pages da RCO Hub. Hoje: **P04** (Performance com VSL) e **P05**
(Performance sem VSL). O lead vai do **servidor da LP** para o **COMERCIAL-RCO**
(o CRM interno da agência, `comercial.rcoacademy.com.br`), nunca para o CRM-RCO (o SaaS).

> Estado: funcional **localmente**, com conteúdo de EXEMPLO. Publicação (DNS,
> EasyPanel, HTTPS) ainda não foi feita. Veja `docs/fluxo-e-operacao.md`.

## Estrutura

```
apps/web/                 Next 16 (App Router, Tailwind 4). Serve /p04 e /p05.
  src/content/pages.ts      TEXTO das páginas (tudo de exemplo) e o vídeo da P04
  src/content/options.ts    opções de Nicho e Faturamento
  src/content/site.ts       indexação, faixa de exemplo, IDs de GTM e Pixel
  src/components/           formulário, seções, player de vídeo, rastreamento
  src/lib/lead-service.ts   POST /api/lead (a lógica de servidor, testável)
  src/app/globals.css       cores e tema (TODA cor passa por aqui)
packages/lead-core/       lógica sem Next: telefone, validação, payload do COMERCIAL,
                          cliente HTTP, fila em arquivos, retentativa
scripts/outbox.mjs        operação da fila (npm run outbox)
docs/fluxo-e-operacao.md  fluxo do lead, falhas, operação e checklist de publicação
```

## Rodar localmente

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # preencher COMERCIAL_BASE_URL e os 2 tokens
npm run dev                                    # http://127.0.0.1:3100  (/p04, /p05)
npm test                                       # 114 testes
npm run typecheck && npm run lint && npm run build
```

**Cuidado com o alvo.** `COMERCIAL_BASE_URL` de produção cria contato e negócio de
verdade e manda mensagem no grupo comercial de verdade. Para desenvolver, aponte para
um COMERCIAL de demonstração (banco descartável), nunca para produção.

## Como mudar as coisas

| Quero... | Onde |
|---|---|
| Trocar textos, títulos, FAQ, passos | `src/content/pages.ts` |
| Mudar as opções de Nicho / Faturamento | `src/content/options.ts` (o servidor só aceita o que está lá) |
| Mudar cores e identidade visual | bloco `:root` em `src/app/globals.css` |
| Ligar GTM / Pixel | `GTM_ID` e `META_PIXEL_ID` em `src/content/site.ts` |
| Liberar indexação / tirar a faixa "Conteúdo de exemplo" | `ALLOW_INDEXING` e `SHOW_PLACEHOLDER_BADGE` em `site.ts` |
| Colocar o vídeo real da P04 | ver abaixo |
| Criar uma página nova (P01, P02...) | novo item em `PAGES` e em `PAGE_IDS`, uma pasta em `src/app/<p>/page.tsx` (3 linhas, copie a `p04`), e um token `COMERCIAL_LEAD_TOKEN_<ID>` |

`site.ts` é código, e não variável de ambiente, de propósito: o EasyPanel repassa toda
variável como build-arg, e valor embutido no build só vale se o Dockerfile o declarar.

### Trocar o vídeo da P04

A página só conhece `VideoSource` (`components/video/types.ts`); quem desenha o player é
um adaptador por `kind`. Hoje: `placeholder` (caixa com botão de play) e `embed` (iframe
genérico, só https).

- Provedor que dá URL de iframe (Panda, Vimeo, YouTube): em `pages.ts`, troque
  `source: { kind: "placeholder", ... }` por `{ kind: "embed", url: "https://...", title: "..." }`.
- Provedor com SDK (para saber o progresso e revelar o formulário no meio do vídeo): crie
  `components/video/<Provedor>Player.tsx`, adicione o `kind` em `types.ts` e registre em
  `VideoSlot.tsx`. O tipo obriga a registrar; nenhuma seção da página muda.

## O que já está garantido (e testado)

- O lead é **gravado em disco antes** de falar com o COMERCIAL; a pessoa nunca vê erro dele.
- COMERCIAL fora do ar: o lead fica pendente, sobrevive a reinício do servidor da LP e é
  reenviado, **uma vez só**.
- Reenvio, duplo clique e "recarreguei e mandei de novo" não duplicam contato, negócio nem aviso.
- O token do COMERCIAL só existe no servidor (variável sem `NEXT_PUBLIC_`).
- O aviso no grupo não leva UTM, gclid nem fbclid; esses dados ficam só no cadastro do contato.
