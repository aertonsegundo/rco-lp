# Fluxo do lead, falhas e operação

## 1. Do clique ao aviso no grupo

1. **Entrada.** A visita chega com `utm_*`, `gclid`, `fbclid`. O navegador guarda na
   **sessão** (`sessionStorage`; some ao fechar a aba). Evento `lp_view` no dataLayer.
2. **Formulário.** Nome, WhatsApp (máscara `(11) 99999-8888`), Nicho, Faturamento e
   consentimento. Validação com o mesmo schema do servidor (`lead-core`). Um campo escondido
   (honeypot) pega robô. Cada tentativa de envio tem um `respondentId` (UUID) gerado no
   navegador; reenviar usa o mesmo.
3. **`POST /api/lead` (servidor da LP).** Nesta ordem:
   origem e tamanho → honeypot → limite por IP → **revalida tudo** → limite por telefone →
   dedupe por telefone+página (10 min) → **grava o lead em arquivo (`pending/`)** → responde
   200 → **só depois** entrega ao COMERCIAL (`after`).
4. **Entrega.** `POST {COMERCIAL_BASE_URL}/api/webhooks/leads/respondi/<token>` com o corpo no
   formato da Respondi (contrato em `docs/integracao-lps-p04-p05.md` do repositório
   COMERCIAL-RCO). O token é por página e vem de variável de ambiente do servidor.
5. **No COMERCIAL-RCO.** Acha o contato pelo telefone (atualiza) ou cria (origem "Respondi");
   grava os campos personalizados (Página de origem, Nicho, Faturamento, UTMs, gclid, fbclid);
   cria o negócio na primeira etapa do funil da integração; avisa o grupo comercial pelo
   número por QR "Só disparos", **sem UTM, gclid e fbclid**. Idempotente por `respondent_id`.
6. **Conversão.** Na tela de sucesso: `lp_lead` no dataLayer e `Lead` no Pixel (se houver),
   com `event_id` = `respondent_id`, para deduplicar com um evento de servidor (CAPI) no futuro.

## 2. Fila (outbox) e retentativa

Um arquivo JSON por lead em `LEAD_OUTBOX_DIR`: `pending/`, `sent/`, `failed/`. Escrita atômica,
permissão 600. O worker (ligado por `instrumentation.ts`) roda a cada 15 s e entrega no máximo
20 por rodada.

| Resposta do COMERCIAL | Resultado |
|---|---|
| 200 `{ok:true}` (ou `duplicate:true`) | `sent` |
| 200 `{ok:true, warning:"processing_error"}` | `sent`, **marcado para atenção** (registrou, mas o processamento lá falhou; reenviar devolveria `duplicate`, então não adianta retentar) |
| 200 `{ignored: no_phone / unparseable / disabled}` | `failed` (NÃO virou lead: erro de mapeamento ou integração desligada) |
| 404 | `failed` (token não existe) |
| 400, 401, 403, 413, outros 4xx | `failed` |
| 429 | retenta respeitando `Retry-After` |
| 5xx, 408, timeout (6 s), erro de rede | retenta |

Retentativas esperam 30 s, 2 min, 10 min, 30 min, 2 h, 6 h, 12 h, 24 h. Depois de 9
tentativas (~45 h) o item vai para `failed`. Cobre deploy do COMERCIAL (minutos) e queda longa.
Configuração ausente (`COMERCIAL_BASE_URL` ou token) mantém o lead **pendente**, não perde.
Enviados são apagados após 30 dias (`OUTBOX_SENT_RETENTION_DAYS`), pois têm nome e telefone.

## 3. Operação

- `GET /api/health`: contagens da fila e se a configuração existe (nunca nome, telefone,
  token nem URL). `attention > 0` = há lead falho ou enviado com aviso, alguém precisa olhar.
  `oldestPendingSec` alto = o COMERCIAL pode estar fora do ar.
- `npm run outbox -- status | list [failed|pending|sent] | show <id> [--full] | retry <id>`.
  Mostra telefone e nome mascarados, exceto com `--full`. Em produção, rode dentro do
  container com `LEAD_OUTBOX_DIR` apontando para o volume.
- Logs em JSON de uma linha (`evt`: `lead.received`, `lead.sent`, `lead.retry_scheduled`,
  `lead.failed`, `lead.exhausted`, `worker.started`...). Sem telefone inteiro nem nome.

## 4. O que NÃO está coberto (limites conhecidos)

- **Um container só.** A fila é em arquivos e os limitadores de taxa ficam em memória. Com
  mais de uma réplica, vira "por instância" e a fila precisaria de trava (ou de SQLite).
- **Sem volume persistente, um reinício apaga os leads pendentes.** Em produção o
  `LEAD_OUTBOX_DIR` TEM que ser um volume.
- **Falha ao avisar o grupo é silenciosa no COMERCIAL** (best-effort, só `console.warn`, sem
  retentativa). A LP não fica sabendo: o lead entra, mas ninguém é avisado.
- **Erro de processamento no COMERCIAL responde 200** (`warning`); a LP só percebe pelo corpo.
- **Rastreamento só na sessão.** Quem clica no anúncio, sai e volta em outra aba/dia perde
  gclid/UTM. Guardar por mais tempo (cookie) depende do texto de LGPD.
- **Sem CSP.** GTM, Pixel e o player ainda não foram escolhidos; a política certa depende deles.
- UTM/gclid/fbclid viram campos personalizados, mas **não alimentam** a atribuição nativa do
  COMERCIAL (links `/go/<code>`, Google Ads offline, Meta CAPI).

## 5. Checklist para PUBLICAR (ainda não feito)

- [ ] Conteúdo final (`pages.ts`), opções (`options.ts`), texto de LGPD e `/privacidade`.
- [ ] GTM/Pixel (`site.ts`), `ALLOW_INDEXING`, tirar a faixa de exemplo, definir a CSP.
- [ ] Criar no COMERCIAL (produção): os 10 campos personalizados e as 2 integrações; copiar os
      tokens. Conectar o número por QR "Só disparos" e configurar o grupo no sino da aba Leads.
- [ ] DNS `lp.rcohub.com` (hoje sem registro; `rcohub.com` aponta para outro host), app no
      EasyPanel, HTTPS, Dockerfile (o build standalone já foi validado: `apps/web/.next/standalone/apps/web/server.js`).
- [ ] **Volume persistente** montado em `LEAD_OUTBOX_DIR`.
- [ ] Variáveis (`COMERCIAL_BASE_URL`, `COMERCIAL_LEAD_TOKEN_P04/P05`) só como env de runtime.
      **O EasyPanel repassa toda variável como `--build-arg`**: nunca declarar o token como `ARG`,
      e um build que falhar ecoa as variáveis no log (`/etc/easypanel/actions/*.log`): apagar o
      log depois de diagnosticar.
- [ ] Monitorar `/api/health` (`attention` e `oldestPendingSec`).
- [ ] Teste ponta a ponta em produção com um lead de teste (e depois apagá-lo no COMERCIAL).
