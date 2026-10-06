"use client";

import { BookOpen, BotMessageSquare, Radar, Target, UserCheck, UserRound } from "lucide-react";
import { useRef } from "react";
import { AnimatedBeam, BeamContainer, BeamNode } from "@/components/ui/animated-beam";

// ============================================================
// Diagrama do fluxo real de "O que está incluído" (seção 3): os nós são
// literalmente as etapas que essa seção descreve em texto logo abaixo, não
// uma ilustração genérica de "IA fazendo algo".
//
// Sequência principal, numa fileira só, uma seta sólida e direcional entre
// cada par consecutivo (sem convergência, sem nó recebendo seta de mais de
// um lugar):
//   Lead → Agente IA → Comercial → Trackeamento → Pixel
// "Trackeamento" é um nó de verdade da fileira (não um conceito espalhado
// em setas saindo de vários nós): ele fica DEPOIS de todo o funil e
// ALIMENTA o Pixel, então "ponta a ponta" já fica implícito pela posição,
// sem precisar de seta extra saindo do Lead ou do Agente direto pro Pixel.
//
// Único satélite do diagrama: Base de Conhecimento, pendurada abaixo do
// Agente (é o que ele consulta pra responder, não um passo da sequência) —
// ligada por uma linha pontilhada vertical simples (`border-dotted`, CSS
// puro), não pela mesma seta curva/animada do fluxo principal, pra marcar
// visualmente que é consulta, não sequência.
//
// Caixa tracejada (`CRM_BOX`/`CRM_LABEL`): Agente IA, Base de conhecimento,
// Comercial e Trackeamento ficam DENTRO dela — é o CRM. Lead e Pixel ficam
// de fora, um de cada lado, porque nenhum dos dois é parte do CRM (a pessoa
// que manda mensagem não é "do" CRM, e o Pixel é da Meta/Google, não da RCO
// Hub). As setas continuam ligando os 5 nós na mesma sequência de sempre;
// a caixa é só decoração por cima, não muda `AnimatedBeam` nenhum — a
// medição de posição usa os refs dos nós, não a estrutura do DOM em volta.
//
// `ICON_SLOT`: os 5 nós da fileira principal não são todos do mesmo
// tamanho de propósito (o Agente é maior, é o nó "herói" do diagrama) — mas
// a curvatura das setas é 0 (reta) em todas, o que só fica reto de verdade
// se o CENTRO de cada nó estiver na mesma altura. Envolver cada ícone numa
// caixa de altura fixa e centralizada resolve isso sem precisar calcular
// padding manualmente por tamanho: não importa se a caixa do ícone é 48px
// ou 64px, o centro dela cai sempre no meio dos 64px do slot.
// ============================================================

// Menor no mobile (`h-11`=44px) que no resto (`sm:h-16`=64px, o tamanho do
// maior ícone, o Agente): ver o comentário completo mais abaixo, na
// explicação de por que a fileira precisou encolher tudo no mobile.
const ICON_SLOT = "flex h-11 items-center justify-center sm:h-16";

// Caixa neutra de todo nó (igual à do Trackeamento): sem cor de fundo nem
// brilho, só o ícone dentro é colorido. Testado antes com fundo colorido +
// glow por nó (ex.: `bg-brand/10 shadow-[0_0_15px_...]` no Agente) e ficou
// genérico demais, tipo "neon" — a caixa em si não deveria chamar atenção,
// só o ícone.
const NODE_BOX = "border-line bg-bg";

// Sem token de projeto pra estes dois: são destaques isolados só do ícone
// do Pixel e da Base de Conhecimento, não uma cor reaproveitada em outro
// lugar do site.
const PIXEL_PURPLE = "#a855f7";
const AMBER = "#f59e0b";

// Caixa tracejada que envolve Agente IA + Base de conhecimento + Comercial +
// Trackeamento: é o que fica DENTRO do CRM. Lead (a pessoa que manda
// mensagem) e Pixel (a plataforma de anúncio) ficam de fora de propósito,
// um de cada lado — o CRM não "contém" a pessoa nem a Meta/Google, ele fica
// entre os dois. Pedido explícito do usuário: o diagrama não deixava claro
// que o produto é um CRM com tudo centralizado.
//
// Fica em fileira horizontal em QUALQUER largura de tela (pedido explícito
// do usuário — nada de empilhar na vertical no mobile, e nada de rolagem
// horizontal própria também). As três tentativas anteriores foram, nessa
// ordem: (1) fileira horizontal + `min-w-0` na caixa do CRM — sobrepôs os
// 3 nós de dentro; (2) fileira horizontal + `min-w-fit` + rolagem
// horizontal própria — funcionava, mas deixava o diagrama com scroll
// interno; (3) empilhar tudo na vertical no mobile — cabia sem rolagem,
// mas encolheu tanto a caixa do CRM que o rótulo "Seu CRM RCO"
// (`whitespace-nowrap`, sem quebra) ficou mais largo que ela, vazou pra
// fora sem nada pra conter (a rede de segurança do item 2 tinha sido
// removida) e voltou o scroll horizontal da PÁGINA inteira. A solução de
// verdade: encolher os NÚMEROS (ícone, texto, vão, respiro) o bastante no
// mobile pra a fileira horizontal caber de verdade, sem precisar de nenhum
// truque de layout pra disfarçar que não cabe.
const CRM_BOX = "relative flex-1 rounded-2xl border border-dashed border-brand/40 px-1 pt-6 pb-1 sm:px-5 sm:pt-9 sm:pb-4";
// `border-white`/`text-white` (não `border-brand`/`text-brand`, o padrão
// original): pedido explícito do usuário pro contorno e o texto do rótulo
// "Seu CRM RCO" ficarem em branco.
const CRM_LABEL =
  "absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/40 bg-surface px-2 py-0.5 text-[8px] font-semibold tracking-wide text-white uppercase sm:-top-3 sm:px-3 sm:text-[10px]";

function NodeLabel({ title, caption }: { title: string; caption: string }) {
  return (
    // Nada de `break-words` aqui (tentativa anterior, removida): quebrava
    // no MEIO de qualquer palavra grande demais pra caber nos 44px de
    // `max-w-11`, incluindo "Agente IA" (virava "AGENTE" numa linha e "IA"
    // sozinho embaixo) e "pré-qualifica" (quebrava no meio da palavra) —
    // pedido explícito do usuário pra nenhum dos dois quebrar.
    <div className="flex max-w-11 flex-col items-center gap-0.5 text-center sm:max-w-28">
      {/* `whitespace-nowrap` no título: today os títulos são curtos o
          bastante (1-2 palavras) pra caber numa linha só usando o respiro
          que o `gap-7` da fileira já garante entre colunas, sem precisar
          reservar altura extra pra uma segunda linha do título. Se
          estourar um pouco a largura de 44px, o `gap-7` absorve. */}
      <span className="text-[8px] font-semibold tracking-wider whitespace-nowrap text-ink uppercase sm:text-[10px]">{title}</span>
      {/* Legenda: quebra normal nos ESPAÇOS entre palavras (várias palavras
          curtas, cabe em 2-3 linhas sem problema); sem `break-words`, uma
          palavra sozinha maior que a caixa (ex.: "pré-qualifica") deixa de
          quebrar no meio — ela some por fora da caixa, mas inteira. */}
      <span className="text-[7px] leading-tight text-mute sm:text-[9px]">{caption}</span>
    </div>
  );
}

export function IncludedFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HTMLDivElement>(null);
  const comercialRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const pixelRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  return (
    <BeamContainer
      ref={containerRef}
      className="mx-auto flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-2xl border border-line bg-surface px-1 py-6 sm:max-w-5xl sm:px-4 sm:py-8 md:p-10"
    >
      {/* Fileira horizontal em qualquer largura de tela (ver comentário de
          `CRM_BOX`): os tamanhos abaixo (ícone, texto, vão) são bem
          menores no mobile especificamente pra essa fileira caber sem
          precisar encolher nem rolar — `overflow-hidden` acima é só uma
          rede de segurança (não devia nunca entrar em ação; se entrar,
          alguma medida aqui embaixo ficou grande demais pra alguma tela). */}
      <div className="flex w-full items-start justify-between gap-0 sm:gap-3">
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <div className={ICON_SLOT}>
            <BeamNode ref={leadRef} className={`size-9 ${NODE_BOX} sm:size-12`}>
              <UserRound aria-hidden="true" className="size-4 text-mute sm:size-6" />
            </BeamNode>
          </div>
          <NodeLabel title="Lead" caption="Manda mensagem no WhatsApp" />
        </div>

        {/* Tudo aqui dentro é o CRM (ver comentário de `CRM_BOX`): Lead (fora,
            à esquerda) entra nele, Pixel (fora, à direita) é quem recebe o
            que sai dele — nenhum dos dois faz parte do CRM em si. */}
        <div className={CRM_BOX}>
          <span className={CRM_LABEL}>Seu CRM RCO</span>
          {/* `justify-center` (não `justify-between`): com `justify-between`,
              os 3 nós de dentro ficavam esticados até encostar nas bordas
              tracejadas da caixa, com um vão enorme entre eles — pedido do
              usuário pra ficarem mais próximos e mais pra dentro.
              `gap-4` no mobile (era `gap-0`, suposição errada: achei que
              não sobrava espaço nenhum na fileira, mas quem não tinha
              espaço era só a fileira de ÍCONES do topo — a caixa do CRM em
              si tem bem mais largura que os 3 nós somados, e o `gap-0`
              antigo, combinado com `justify-center`, colava os rótulos uns
              nos outros sem vão nenhum; passou por `gap-2`, `gap-4` e
              `gap-6` antes deste valor). A partir de `sm` o vão passou por
              `gap-3`, depois `gap-6` (rejeitado uma vez, depois aceito) até
              chegar no mesmo `gap-7` do mobile — por isso um `gap-7` só,
              sem prefixo `sm:` duplicando o mesmo valor. */}
          <div className="flex items-start justify-center gap-7">
            {/* Único nó com satélite: a linha pontilhada abaixo do card é CSS
                puro (não é `AnimatedBeam`), de propósito — consulta, não
                sequência. */}
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className={ICON_SLOT}>
                <BeamNode ref={agentRef} className={`size-11 ${NODE_BOX} sm:size-16`}>
                  <BotMessageSquare aria-hidden="true" className="size-5 text-brand sm:size-8" />
                </BeamNode>
              </div>
              {/* "pré‑qualifica" usa hífen não separável (U+2011), não o
                  hífen comum "-": mesmo sem `break-words`, o navegador trata
                  QUALQUER hífen comum como ponto de quebra válido por conta
                  própria (regra padrão de quebra de linha, nada a ver com
                  Tailwind) — era isso que ainda quebrava a palavra ao meio
                  mesmo depois de tirar o `break-words`. Visualmente é
                  idêntico a um hífen normal. */}
              <NodeLabel title="Agente IA" caption="Responde e pré‑qualifica sozinho" />
              <div aria-hidden="true" className="h-4 border-l-2 border-dotted border-line sm:h-6" />
              {/* `size-3` (12px) era pequeno demais pro `BookOpen`: é um
                  ícone com vários traços finos (lombada, páginas, curva),
                  e nesse tamanho perdia os detalhes e virava só um borrão
                  ("um ponto", como reportado). `size-4` (16px) é o mesmo
                  tamanho de ícone usado nos outros nós pequenos da fileira
                  (Comercial, Tracking, Pixel, todos com `size-4` dentro de
                  caixa maior); a caixa (`size-8`) cresceu junto só o
                  suficiente pra não ficar apertada. */}
              <BeamNode ref={baseRef} className={`size-8 ${NODE_BOX} sm:size-10`}>
                <BookOpen aria-hidden="true" className="size-4" style={{ color: AMBER }} />
              </BeamNode>
              {/* `block w-full` (não só `text-center`): sem largura
                  explícita, o `span` encolhe pro tamanho do próprio
                  conteúdo (a linha mais larga entre "BASE DE" e
                  "CONHECIMENTO" quebradas), e `text-center` sozinho não
                  tem o que centralizar dentro de uma caixa do tamanho
                  exato do próprio texto. `w-full` faz a caixa ocupar a
                  largura cheia da coluna (os 44px de `max-w-11`), aí sim
                  as duas linhas centralizam de verdade uma em relação à
                  outra. */}
              <span className="block w-full max-w-11 text-center text-[7px] leading-tight tracking-wide text-mute uppercase sm:max-w-20 sm:text-[9px]">
                Base de conhecimento
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className={ICON_SLOT}>
                <BeamNode ref={comercialRef} className={`size-9 ${NODE_BOX} sm:size-12`}>
                  <UserCheck aria-hidden="true" className="size-4 text-ok sm:size-5" />
                </BeamNode>
              </div>
              <NodeLabel title="Comercial" caption="Fecha a venda com quem já está pronto" />
            </div>

            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className={ICON_SLOT}>
                <BeamNode ref={trackingRef} className={`size-9 ${NODE_BOX} sm:size-12`}>
                  <Radar aria-hidden="true" className="size-4 text-mute sm:size-5" />
                </BeamNode>
              </div>
              {/* "Tracking" (não "Trackeamento"): mesmo termo, texto mais
                  curto, cabe melhor numa linha só sem precisar de gap
                  extra. Legenda também encurtada pelo mesmo motivo. */}
              <NodeLabel title="Tracking" caption="Junta dados da campanha e da venda" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <div className={ICON_SLOT}>
            <BeamNode ref={pixelRef} className={`size-9 ${NODE_BOX} sm:size-12`}>
              <Target aria-hidden="true" className="size-4 sm:size-5" style={{ color: PIXEL_PURPLE }} />
            </BeamNode>
          </div>
          <NodeLabel title="Pixel" caption="Recebe os eventos pro anúncio otimizar" />
        </div>
      </div>

      {/* Sequência principal: uma seta sólida e direcional por segmento,
          sem nenhum nó recebendo de mais de um lugar. Curvatura 0 (reta)
          nos quatro — só fica reto de verdade porque o `ICON_SLOT` acima
          garante que todos os 5 nós têm o centro na mesma altura, mesmo o
          Agente sendo maior. */}
      <AnimatedBeam containerRef={containerRef} fromRef={leadRef} toRef={agentRef} duration={3} curvature={0} gradientStartColor="var(--brand)" gradientStopColor="var(--brand)" />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agentRef}
        toRef={comercialRef}
        duration={3}
        delay={0.6}
        curvature={0}
        gradientStartColor="var(--brand)"
        gradientStopColor="var(--ok)"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={comercialRef}
        toRef={trackingRef}
        duration={3}
        delay={1.2}
        curvature={0}
        gradientStartColor="var(--ok)"
        gradientStopColor={PIXEL_PURPLE}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={trackingRef}
        toRef={pixelRef}
        duration={3}
        delay={1.8}
        curvature={0}
        gradientStartColor={PIXEL_PURPLE}
        gradientStopColor={PIXEL_PURPLE}
      />
    </BeamContainer>
  );
}
