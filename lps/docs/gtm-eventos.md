# GTM e eventos do dataLayer (P04 e P05)

> As páginas voltaram à copy original (commit de base `d27772a`); a copy v2 está guardada em `docs/copy-v2.md` e implementada no commit `35d8393`. Os eventos abaixo valem para as duas versões.

Container: **GTM-P9XNXV2B** (constante `GTM_ID` em `apps/web/src/content/site.ts`, não é variável de ambiente).
Snippet carregado no layout raiz (`components/tracking/Analytics.tsx`, `next/script` com `beforeInteractive`) e `<noscript>` logo no início do `<body>`.

**Pixel do Meta e GA4 são configurados DENTRO do GTM.** O código não carrega Pixel (`META_PIXEL_ID` vazio) nem GA4. Scroll e tempo na página também ficam por conta do GTM (gatilhos nativos), não há evento no código.

**Nenhum dado pessoal vai ao dataLayer** (nem nome, WhatsApp ou email, nem em hash). Só categorias, ids e parâmetros de campanha. Para Conversions API/Advanced Matching use o `event_id` (ver abaixo), não dados da pessoa.

## Eventos

Todo evento leva `page_id` (`P04`, `P05`; `other` só em `page_view` de rota que não é LP).

| Evento | Quando | Parâmetros além de `page_id` |
|---|---|---|
| `page_view` | Entrada na página e a cada navegação client-side | `page_path`; `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `wbraid`, `gbraid` (só os presentes na sessão) |
| `cta_click` | Clique em qualquer botão que rola ao formulário | `cta_location` (P04: `resumo_oferta`, o botão depois do FAQ; P05: `chamada_final`, o botão depois do FAQ; `hero` só existe se um hero voltar a ter botão), `cta_text` |
| `form_start` | Primeiro foco em um campo do formulário (1x por visita) | |
| `form_submit` | Clique em enviar (tentativa, válida ou não) | |
| `form_error` | Falha ao enviar | `error_type`: `validation`, `server`, `network`, `rate_limit`; `fields` (só em `validation`: nomes dos campos, ex. `email,whatsapp`) |
| `generate_lead` | Envio com sucesso (HTTP 200 do servidor) | `nicho`, `faturamento`, `event_id` |
| `faq_open` | Abertura de uma pergunta (fechar não conta) | `question`, `question_index` (1 = primeira) |
| `video_play` | Primeira reprodução do vídeo real | `video_provider` |
| `video_progress` | 25, 50, 75 e 100% do vídeo, 1x cada | `video_provider`, `percent` |

Notas:
- `generate_lead.event_id` é o mesmo UUID enviado ao COMERCIAL como `respondent_id` (o contrato já aceita; nada mudou lá). Reenvio da mesma tentativa reaproveita o id. Use o mesmo valor como `event_id` do Pixel e da Conversions API para o Meta deduplicar.
- **Vídeo:** hoje a P04 tem só um espaço reservado, que NÃO gera `video_play`/`video_progress`. O gancho está pronto em `components/video/VideoSlot.tsx` (`onPlay`, `onProgress(25|50|75|100)`). Quando o provedor for escolhido, crie um adaptador com o SDK dele que chame esses dois callbacks. Embed por iframe puro não informa play nem progresso.
- `page_view` é empurrado depois da hidratação e entra na fila do `dataLayer`, mesmo se o GTM ainda estiver baixando. Por isso use **o evento personalizado `page_view`** como gatilho das tags de visualização, não o gatilho "Page View" nativo (`gtm.js`), que dispara antes de `page_id` e UTMs existirem.

## Variáveis de dataLayer a criar no GTM (tipo "Variável da camada de dados", versão 2)

`page_id`, `page_path`, `cta_location`, `cta_text`, `error_type`, `fields`, `nicho`, `faturamento`, `event_id`, `question`, `question_index`, `video_provider`, `percent`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`.

## Gatilhos (tipo "Evento personalizado", correspondência exata)

Um por evento da tabela: `page_view`, `cta_click`, `form_start`, `form_submit`, `form_error`, `generate_lead`, `faq_open`, `video_play`, `video_progress`.

## Tags sugeridas

**GA4**
- Tag de configuração/Google tag com o ID de medição, disparando no gatilho `page_view` (desligue o page_view automático da tag para não contar 2x).
- Uma tag "Evento do GA4" por gatilho, com o mesmo nome do evento e os parâmetros como variáveis acima. Marque `generate_lead` como evento-chave (conversão). Registre `page_id`, `cta_location`, `nicho`, `faturamento`, `error_type` como dimensões personalizadas se quiser filtrar por elas.

**Meta Pixel** (tag HTML personalizada ou template da comunidade, ID do Pixel como constante do GTM)
- `PageView`: `fbq('init', '<ID>'); fbq('track', 'PageView');` no gatilho `page_view`.
- `Lead`: no gatilho `generate_lead`:
  `fbq('track', 'Lead', {content_name: '{{dlv - page_id}}', content_category: '{{dlv - nicho}}'}, {eventID: '{{dlv - event_id}}'});`
- Opcional: `ViewContent` em `faq_open`/`cta_click` para públicos de remarketing.

**Google Ads** (se for usar): tag de conversão no gatilho `generate_lead`; `gclid` já está no `page_view`.

## Consentimento (LGPD)

O GTM carrega em toda visita, sem aviso de cookies. Antes de publicar, decidir com a RCO: banner de consentimento (CMP) com Consent Mode v2 no próprio GTM, ou aceitar o risco. Não foi implementado nada porque exige texto e decisão jurídica.

## Como testar

1. `npm run dev` (porta 3100), abrir `/p04` ou `/p05` com `?utm_source=teste&gclid=abc`.
2. No console do navegador: `dataLayer` mostra os eventos na ordem.
3. Para ver dentro do GTM: Tag Assistant (tagassistant.google.com), modo preview apontando para a URL. Atenção: testar com o GTM real publica visitas de teste no GA4/Pixel se as tags estiverem ativas; use o modo Preview ou uma propriedade de teste.
4. Testes automáticos: `npx vitest run` (`lib/tracking/events.test.ts` confere que `generate_lead` chega no sucesso e que nada pessoal entra).
