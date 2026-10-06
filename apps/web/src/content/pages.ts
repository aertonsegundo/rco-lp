import type { VideoSource } from "@/components/video/types";

// ============================================================
// CONTEÚDO DAS PÁGINAS. Fonte canônica do texto: docs/copy-v2.md (copy v2,
// 06/10/2026). Aqui o texto está EXATAMENTE como nessa cópia: mudar copy é
// editar este arquivo, sem mexer em componente.
//
// Cada página é: hero → formulário → `sections` (na ordem em que aparecem).
// Uma seção é um de 4 tipos (`Section`), e o miolo de uma seção de conteúdo é
// uma lista de `Block`s renderizados na ordem em que estão aqui. Assim a
// ordem do texto da copy é a ordem da tela, sem componente por seção.
//
// Para trocar o vídeo da P04: mude `video` (ver README, "Trocar o vídeo da
// P04"). Para adicionar uma página nova: novo item em PAGES + uma pasta em
// src/app com 3 linhas + o id em PAGE_IDS.
// ============================================================

export const PAGE_IDS = ["P04", "P05"] as const;
export type PageId = (typeof PAGE_IDS)[number];

/** Peças de texto de uma seção, na ordem em que aparecem. */
export type Block =
  /** Parágrafo comum. */
  | { t: "p"; text: string }
  /** Frase de destaque (negrito na copy). */
  | { t: "strong"; text: string }
  /** Lista com "•" na copy: lista de verdade. */
  | { t: "list"; items: string[] }
  /** Frases curtas em sequência: `timeline` (passo a passo ligado por linha),
   *  `lines` (uma por linha, com barra lateral) ou `chips` (palavras soltas). */
  | { t: "flow"; variant: "timeline" | "lines" | "chips"; items: string[] }
  /** Blocos com título (cartões). */
  | { t: "cards"; items: { title: string; blocks: Block[] }[] };

export type Section =
  | { kind: "content"; id: string; heading: string; blocks: Block[] }
  | {
      kind: "steps";
      id: string;
      heading: string;
      items: { title: string; lines: string[] }[];
      cta: string;
    }
  | { kind: "faq"; id: string; heading: string; items: { q: string; a: string[] }[] }
  | { kind: "cta"; id: string; heading: string; blocks: Block[]; cta: string };

export interface PageConfig {
  id: PageId;
  /** Caminho público da página. */
  path: string;
  /** Vai em "Página de origem" no COMERCIAL. */
  formId: string;
  formName: string;
  /** Título da aba / SEO. */
  title: string;
  description: string;
  hero: { eyebrow: string; title: string; blocks: Block[]; cta: string };
  /** null = página sem vídeo (P05). */
  video: null | { source: VideoSource };
  form: { heading: string; text: string; submit: string; sending: string; done: string };
  sections: Section[];
}

export const PAGES: Record<PageId, PageConfig> = {
  P04: {
    id: "P04",
    path: "/p04",
    formId: "lp-p04",
    formName: "LP P04 · Performance com VSL",
    title: "Performance em tráfego e vendas | RCO Hub",
    description:
      "A RCO Hub cria campanhas para gerar novas oportunidades e acompanha o que acontece depois que o lead chega ao seu negócio.",
    hero: {
      eyebrow: "Performance para empresas que querem gerar mais oportunidades e acompanhar melhor as vendas",
      title: "Seu problema pode não ser falta de lead. Pode ser o que acontece entre o anúncio e a venda.",
      blocks: [
        { t: "p", text: "Você investe para trazer novas pessoas para sua empresa. A RCO acompanha também o que acontece depois que elas chegam." },
        { t: "p", text: "Campanhas, qualidade dos contatos, atendimento, avanço das oportunidades e vendas passam a fazer parte da mesma análise." },
        { t: "strong", text: "Assista ao vídeo e entenda como funciona." },
      ],
      cta: "Quero analisar minha operação",
    },
    video: {
      // Troque por um provedor real quando o vídeo existir (ver README).
      source: { kind: "placeholder", title: "Vídeo em produção" },
    },
    form: {
      heading: "Quer entender se essa estrutura faz sentido para sua empresa?",
      text: "Preencha seus dados. Nosso time vai analisar o momento do seu negócio e entrar em contato pelo WhatsApp.",
      submit: "Quero falar com a RCO",
      sending: "Enviando...",
      done: "Recebemos seus dados.",
    },
    sections: [
      {
        kind: "content",
        id: "dor_principal",
        heading:
          "Se você já investiu em anúncios e terminou o mês sem saber o que realmente virou venda, existe uma parte do processo que precisa ser acompanhada melhor.",
        blocks: [
          { t: "p", text: "Não basta olhar quantas pessoas clicaram." },
          { t: "p", text: "Também não basta contar quantas mensagens chegaram no WhatsApp." },
          { t: "strong", text: "A empresa precisa entender o que aconteceu depois." },
          {
            t: "list",
            items: [
              "Os contatos tinham o perfil esperado?",
              "Foram atendidos no tempo certo?",
              "O comercial conseguiu avançar as conversas?",
              "As oportunidades receberam acompanhamento?",
              "Quais campanhas trouxeram pessoas que realmente compraram?",
              "Onde as vendas estão sendo perdidas?",
            ],
          },
          { t: "p", text: "Quando marketing e comercial trabalham separados, fica difícil responder essas perguntas." },
        ],
      },
      {
        kind: "content",
        id: "o_que_a_rco_faz",
        heading: "Não trabalhamos olhando apenas para os anúncios.",
        blocks: [
          {
            t: "p",
            text: "A operação de performance da RCO conecta a geração de novas oportunidades com o acompanhamento do processo de venda.",
          },
          {
            t: "cards",
            items: [
              {
                title: "Geramos novas oportunidades",
                blocks: [
                  { t: "p", text: "Criamos e acompanhamos campanhas para colocar sua empresa na frente de pessoas com potencial de compra." },
                  { t: "p", text: "Dependendo do negócio, essas pessoas podem chegar pelo WhatsApp, por uma página, pelo site ou pela loja virtual." },
                ],
              },
              {
                title: "Acompanhamos a qualidade dos contatos",
                blocks: [
                  { t: "p", text: "Não avaliamos uma campanha apenas pela quantidade de leads." },
                  { t: "p", text: "Analisamos se as pessoas que estão chegando fazem sentido para sua empresa e como elas estão avançando." },
                ],
              },
              {
                title: "Olhamos para o processo comercial",
                blocks: [
                  { t: "p", text: "Quando a venda depende de atendimento, acompanhamos como essas oportunidades estão sendo trabalhadas." },
                  { t: "p", text: "Tempo de resposta, organização dos contatos, acompanhamento e avanço das negociações também entram na análise." },
                ],
              },
              {
                title: "Ajustamos a operação a partir do que acontece nas vendas",
                blocks: [
                  { t: "p", text: "As campanhas não ficam isoladas do restante da empresa." },
                  { t: "p", text: "O que acontece com os leads ajuda a orientar os próximos ajustes." },
                ],
              },
            ],
          },
        ],
      },
      {
        kind: "content",
        id: "whatsapp",
        heading: "Seu anúncio pode estar funcionando e mesmo assim sua empresa continuar perdendo vendas no atendimento.",
        blocks: [
          {
            t: "flow",
            variant: "timeline",
            items: [
              "O lead chega.",
              "Demora para receber resposta.",
              "Conversa com alguém.",
              "Fica de retornar.",
              "Ninguém acompanha.",
              "Dias depois, aquela oportunidade já esfriou.",
            ],
          },
          { t: "p", text: "Por isso, quando o WhatsApp faz parte da venda, não olhamos somente para a chegada do contato." },
          { t: "strong", text: "Também precisamos entender como ele está sendo trabalhado." },
        ],
      },
      {
        kind: "content",
        id: "site",
        heading: "Mais acesso no site não significa automaticamente mais vendas.",
        blocks: [
          {
            t: "p",
            text: "Em operações com loja virtual, acompanhamos as campanhas pensando no que realmente acontece depois do clique.",
          },
          {
            t: "flow",
            variant: "lines",
            items: [
              "Quais campanhas estão trazendo compradores.",
              "Quais produtos estão despertando mais interesse.",
              "Onde existe oportunidade de ajuste.",
              "Onde o dinheiro está sendo colocado sem gerar o retorno esperado.",
            ],
          },
          {
            t: "p",
            text: "O objetivo é tomar decisões olhando para o comportamento de compra, e não apenas para o volume de visitas.",
          },
        ],
      },
      {
        kind: "content",
        id: "outra_agencia",
        heading: "Ter tido uma experiência ruim com tráfego não significa que sua empresa não possa vender por anúncios.",
        blocks: [
          {
            t: "p",
            text: "Talvez você já tenha recebido relatórios cheios de números e ainda terminado o mês com a mesma dúvida:",
          },
          { t: "strong", text: "Quanto disso realmente ajudou minha empresa a vender?" },
          { t: "p", text: "É justamente por isso que nosso acompanhamento não termina no gerenciador de anúncios." },
          { t: "p", text: "Precisamos entender o que chegou, o que avançou e o que virou negócio." },
        ],
      },
      {
        kind: "content",
        id: "problema_leads",
        heading: "Nem todo problema de venda começa na campanha.",
        blocks: [
          { t: "p", text: "Às vezes a campanha está trazendo o público errado." },
          { t: "p", text: "Em outros casos, o contato chega certo e o problema aparece depois." },
          {
            t: "flow",
            variant: "lines",
            items: [
              "Pode existir demora na resposta.",
              "Falta de acompanhamento.",
              "Dificuldade do vendedor em conduzir a conversa.",
              "Uma oferta pouco clara.",
              "Falta de organização.",
              "Ou uma combinação desses pontos.",
            ],
          },
          {
            t: "p",
            text: "Antes de simplesmente aumentar o investimento, precisamos entender onde a oportunidade está sendo perdida.",
          },
        ],
      },
      {
        kind: "content",
        id: "crm_rco",
        heading: "Quando a operação precisa de organização, usamos o CRM para acompanhar o caminho dos leads.",
        blocks: [
          { t: "p", text: "O CRM RCO faz parte da estrutura utilizada para dar mais clareza ao processo comercial." },
          {
            t: "p",
            text: "Com ele, é possível organizar contatos, acompanhar negociações e visualizar informações que ajudam o gestor a entender o que está acontecendo.",
          },
          { t: "p", text: "Entre as informações disponíveis estão:" },
          {
            t: "list",
            items: [
              "Leads recebidos",
              "Responsável pelo atendimento",
              "Etapa de cada oportunidade",
              "Histórico das conversas",
              "Origem dos contatos",
              "Vendas registradas",
              "Informações para acompanhamento das campanhas",
            ],
          },
          { t: "p", text: "O CRM é uma ferramenta da operação." },
          { t: "strong", text: "O trabalho de performance não se resume ao CRM." },
        ],
      },
      {
        kind: "steps",
        id: "como_funciona",
        heading: "O primeiro passo é entender o que acontece hoje na sua empresa.",
        items: [
          { title: "Você preenche o formulário", lines: ["Queremos entender seu negócio, seu momento e sua estrutura atual."] },
          {
            title: "Nosso time analisa as informações",
            lines: ["Antes da conversa, conseguimos ter uma visão inicial da empresa e do cenário informado."],
          },
          {
            title: "Conversamos sobre os gargalos atuais",
            lines: ["Entendemos como vocês geram oportunidades hoje, como acontece a venda e onde existem dificuldades."],
          },
          {
            title: "Apresentamos uma estrutura para o seu cenário",
            lines: [
              "Se existir encaixe entre sua empresa e nosso trabalho, mostramos como a RCO pode atuar na geração de demanda e no acompanhamento da operação.",
            ],
          },
        ],
        cta: "Quero falar com a RCO",
      },
      {
        kind: "faq",
        id: "faq",
        heading: "Perguntas frequentes",
        items: [
          {
            q: "A RCO trabalha somente com tráfego pago?",
            a: [
              "Não.",
              "As campanhas são uma parte do trabalho.",
              "Também acompanhamos a qualidade das oportunidades geradas e, quando existe processo comercial, olhamos para o que acontece depois que o lead chega.",
            ],
          },
          {
            q: "Vocês vendem somente o CRM?",
            a: [
              "Não.",
              "O CRM RCO é uma das ferramentas que podem fazer parte da operação.",
              "Nesta página, o serviço apresentado é o trabalho de performance da RCO.",
            ],
          },
          {
            q: "Já contratei agência antes e não tive resultado. Ainda faz sentido conversar?",
            a: [
              "Sim.",
              "Na conversa inicial queremos entender justamente o que foi feito anteriormente, quais foram os problemas e como sua operação funciona hoje.",
              "Isso não significa que toda empresa terá o mesmo cenário ou que anúncios resolverão qualquer problema.",
            ],
          },
          {
            q: "Minha empresa precisa ter vendedores?",
            a: [
              "Não necessariamente.",
              "Existem operações que vendem por equipe comercial e outras que realizam a venda diretamente pelo site.",
              "A estrutura aplicada depende de como sua empresa vende.",
            ],
          },
          {
            q: "Funciona para loja virtual?",
            a: [
              "Pode funcionar.",
              "Nesse caso, o acompanhamento é voltado para campanhas, comportamento de compra e vendas realizadas no site.",
            ],
          },
          {
            q: "Funciona para empresas que vendem pelo WhatsApp?",
            a: [
              "Sim.",
              "Nesse cenário, além das campanhas, conseguimos olhar para a organização e para o acompanhamento das oportunidades que chegam ao atendimento.",
            ],
          },
          {
            q: "Vocês garantem quantidade de vendas?",
            a: [
              "Não.",
              "Nenhuma operação séria consegue garantir um número de vendas sem considerar produto, mercado, preço, atendimento, investimento e diversos outros fatores.",
              "Nosso trabalho é estruturar, acompanhar e melhorar o processo com base nos dados da sua operação.",
            ],
          },
          {
            q: "Quanto custa?",
            a: [
              "O investimento depende do cenário e da estrutura necessária para sua empresa.",
              "Por isso, primeiro coletamos algumas informações e entendemos o momento do negócio.",
            ],
          },
        ],
      },
      {
        kind: "cta",
        id: "chamada_final",
        heading:
          "Se sua empresa já vende, mas ainda existe pouca clareza entre anúncio, oportunidade e venda, queremos entender seu cenário.",
        blocks: [{ t: "p", text: "Preencha o formulário e converse com nosso time sobre a operação atual da sua empresa." }],
        cta: "Quero falar com a RCO",
      },
    ],
  },

  P05: {
    id: "P05",
    path: "/p05",
    formId: "lp-p05",
    formName: "LP P05 · Performance sem VSL",
    title: "Tráfego e acompanhamento comercial para empresas | RCO Hub",
    description:
      "A RCO Hub gera novas oportunidades para sua empresa e acompanha o que acontece entre a chegada do lead e a venda.",
    hero: {
      eyebrow: "Performance para empresas",
      title: "Não basta gerar mais leads. Sua empresa precisa transformar essas oportunidades em vendas.",
      blocks: [
        { t: "p", text: "A RCO cria campanhas para gerar demanda e acompanha o que acontece depois." },
        {
          t: "p",
          text: "Entendemos quais contatos estão chegando, como o comercial está trabalhando essas oportunidades e quais campanhas estão mais próximas das vendas.",
        },
        { t: "p", text: "Para empresas que vendem pelo WhatsApp, por equipe comercial ou pela internet." },
      ],
      cta: "Quero analisar minha empresa",
    },
    video: null,
    form: {
      heading: "Fale com o time da RCO",
      text: "Preencha os dados para nosso time entender melhor o momento da sua empresa antes de entrar em contato.",
      submit: "Quero receber contato",
      sending: "Enviando...",
      done: "Recebemos seus dados.",
    },
    sections: [
      {
        kind: "content",
        id: "identificacao",
        heading:
          "Você coloca dinheiro em anúncios, os contatos chegam, mas ainda existe dificuldade para entender o que realmente está gerando venda?",
        blocks: [
          { t: "p", text: "Isso aparece de várias formas dentro de uma empresa." },
          {
            t: "list",
            items: [
              "Você recebe leads, mas o comercial reclama da qualidade.",
              "O marketing diz que está gerando oportunidades, mas as vendas não acompanham.",
              "O vendedor demora para responder e você só descobre depois.",
              "Existem contatos parados que ninguém voltou a chamar.",
              "Você recebe relatórios de anúncios, mas ainda não sabe o que fazer com aqueles números.",
              "Já trabalhou com outra agência e terminou a experiência sem entender por que não vendeu mais.",
              "Sua empresa depende muito de indicação para conseguir novos clientes.",
              "Você aumenta o investimento, mas não sabe exatamente onde está o problema quando as vendas não aumentam.",
            ],
          },
          { t: "p", text: "São problemas diferentes." },
          { t: "strong", text: "Por isso, também não podem ser tratados olhando somente para os anúncios." },
        ],
      },
      {
        kind: "content",
        id: "forma_de_trabalhar",
        heading: "A campanha traz a oportunidade. A análise continua depois que ela chega.",
        blocks: [
          { t: "p", text: "O trabalho da RCO conecta três partes da operação." },
          {
            t: "cards",
            items: [
              {
                title: "Geração de demanda",
                blocks: [
                  { t: "p", text: "Criamos campanhas para colocar sua empresa na frente de novas pessoas com potencial de compra." },
                  { t: "p", text: "Não buscamos simplesmente aumentar o número de mensagens ou acessos." },
                  { t: "p", text: "Precisamos trazer oportunidades que façam sentido para o negócio." },
                ],
              },
              {
                title: "Acompanhamento das oportunidades",
                blocks: [
                  {
                    t: "p",
                    text: "Quando sua venda acontece pelo WhatsApp ou por um time comercial, acompanhamos o que ocorre com os contatos depois que eles chegam.",
                  },
                  {
                    t: "flow",
                    variant: "timeline",
                    items: ["Quem respondeu.", "Quem avançou.", "Quem ficou parado.", "Quem recebeu acompanhamento.", "Quem comprou."],
                  },
                ],
              },
              {
                title: "Ajustes a partir das vendas",
                blocks: [
                  { t: "p", text: "As informações do comercial ajudam a entender melhor as campanhas." },
                  { t: "p", text: "Se determinado tipo de lead está avançando mais, isso importa." },
                  { t: "p", text: "Se uma campanha gera muitos contatos que não evoluem, isso também importa." },
                  { t: "p", text: "A análise precisa chegar mais perto da venda." },
                ],
              },
            ],
          },
        ],
      },
      {
        kind: "content",
        id: "nao_e_so_trafego",
        heading: "Colocar mais pessoas no WhatsApp não corrige um processo comercial desorganizado.",
        blocks: [
          { t: "p", text: "Imagine que uma campanha gere 100 novos contatos." },
          {
            t: "p",
            text: "Se parte deles demora para receber resposta, outra parte fica sem acompanhamento e ninguém registra quem comprou, aumentar a quantidade de leads não resolve sozinho.",
          },
          {
            t: "p",
            text: "A empresa pode acabar pagando para gerar oportunidades que já existiam e que foram perdidas dentro do próprio atendimento.",
          },
          {
            t: "strong",
            text: "Por isso, quando identificamos um problema depois da geração do lead, ele também precisa entrar na conversa.",
          },
        ],
      },
      {
        kind: "content",
        id: "ja_tentei_trafego",
        heading: "O fato de uma campanha anterior não ter funcionado não explica sozinho por que ela deu errado.",
        blocks: [
          {
            t: "flow",
            variant: "lines",
            items: [
              "Talvez o público não estivesse correto.",
              "Talvez a comunicação não estivesse boa.",
              "Talvez os leads tenham chegado e não tenham sido trabalhados.",
              "Talvez o investimento não estivesse de acordo com o mercado.",
              "Talvez a empresa não tivesse informações suficientes para descobrir.",
            ],
          },
          { t: "p", text: "Antes de colocar mais dinheiro, precisamos entender o que aconteceu." },
          { t: "strong", text: "É dessa forma que conduzimos a análise." },
        ],
      },
      {
        kind: "content",
        id: "leads_nao_prestam",
        heading: "Quando todo lead parece ruim, precisamos descobrir em qual ponto o problema começa.",
        blocks: [
          {
            t: "flow",
            variant: "lines",
            items: [
              "Pode estar na campanha.",
              "Pode estar na oferta.",
              "Pode estar na abordagem.",
              "Pode estar na qualificação.",
              "Pode estar no atendimento.",
              "Pode estar no acompanhamento.",
            ],
          },
          { t: "p", text: "O papel da operação não é simplesmente aceitar que \"o lead é ruim\"." },
          { t: "strong", text: "É identificar padrões e entender o que pode ser corrigido." },
        ],
      },
      {
        kind: "content",
        id: "whatsapp",
        heading: "Acompanhe o que acontece depois que a mensagem chega.",
        blocks: [
          {
            t: "p",
            text: "Quando o WhatsApp é uma parte importante da venda, organização comercial passa a interferir diretamente no aproveitamento das oportunidades.",
          },
          { t: "p", text: "A RCO acompanha pontos como:" },
          {
            t: "list",
            items: [
              "Quantidade de oportunidades geradas",
              "Qualidade dos contatos",
              "Organização do atendimento",
              "Evolução das negociações",
              "Oportunidades que ficaram paradas",
              "Vendas registradas",
              "Origem dos contatos",
            ],
          },
          {
            t: "strong",
            text: "Com isso, campanha e comercial deixam de ser analisados como duas coisas completamente separadas.",
          },
        ],
      },
      {
        kind: "content",
        id: "internet",
        heading: "Sua loja precisa de venda, não apenas de acesso.",
        blocks: [
          { t: "p", text: "Para operações com venda direta pelo site, o acompanhamento muda." },
          {
            t: "p",
            text: "O foco passa a ser entender quais campanhas estão colocando compradores dentro da loja e quais produtos e ofertas estão gerando melhor resposta.",
          },
          {
            t: "p",
            text: "Analisamos o comportamento da operação para tomar decisões sobre onde continuar investindo e onde existem pontos que precisam ser corrigidos.",
          },
        ],
      },
      {
        kind: "content",
        id: "crm_rco",
        heading: "Nossa equipe também utiliza tecnologia própria para organizar informações da operação.",
        blocks: [
          {
            t: "p",
            text: "Quando a empresa trabalha com leads e vendas pelo WhatsApp, o CRM RCO ajuda a centralizar o acompanhamento.",
          },
          { t: "p", text: "É possível visualizar:" },
          {
            t: "list",
            items: [
              "Contatos recebidos",
              "Histórico das conversas",
              "Responsável pelo atendimento",
              "Etapa da negociação",
              "Origem do lead",
              "Vendas registradas",
              "Informações relacionadas às campanhas",
            ],
          },
          {
            t: "p",
            text: "Isso ajuda nossa equipe e o próprio gestor da empresa a terem uma visão mais clara do processo.",
          },
        ],
      },
      {
        kind: "content",
        id: "acompanhamento_comercial",
        heading: "Não assumimos o lugar do seu vendedor. Ajudamos sua empresa a entender melhor o processo.",
        blocks: [
          { t: "p", text: "O objetivo não é entrar na sua empresa e realizar todas as vendas no lugar do time." },
          {
            t: "p",
            text: "Nosso trabalho é acompanhar a operação, identificar problemas e orientar melhorias no processo comercial.",
          },
          { t: "p", text: "Isso pode envolver pontos como:" },
          {
            t: "list",
            items: [
              "Organização dos leads",
              "Velocidade de resposta",
              "Forma de acompanhar oportunidades",
              "Etapas da negociação",
              "Uso do CRM",
              "Recuperação de contatos",
              "Qualificação",
              "Acompanhamento dos números do comercial",
            ],
          },
          { t: "p", text: "O time da empresa continua responsável pela venda." },
          { t: "strong", text: "A RCO ajuda a tornar esse processo mais visível e organizado." },
        ],
      },
      {
        kind: "steps",
        id: "como_funciona",
        heading: "Antes de apresentar qualquer proposta, queremos entender sua empresa.",
        items: [
          { title: "Preencha o formulário", lines: ["Envie as informações básicas sobre sua empresa e seu momento atual."] },
          {
            title: "Nosso time analisa o cenário",
            lines: ["O objetivo é chegar na conversa já entendendo melhor o porte e o modelo do negócio."],
          },
          {
            title: "Conversamos sobre sua operação",
            lines: [
              "Queremos saber como sua empresa gera oportunidades hoje, como vende e onde você acredita que estão os principais problemas.",
            ],
          },
          {
            title: "Avaliamos se existe encaixe",
            lines: [
              "Nem toda empresa precisa da mesma estrutura.",
              "Se nosso trabalho fizer sentido para o seu cenário, mostramos como podemos atuar e quais seriam os próximos passos.",
            ],
          },
        ],
        cta: "Quero conversar com o time",
      },
      {
        kind: "content",
        id: "para_quem_faz_sentido",
        heading:
          "Nosso trabalho foi pensado para empresas que já possuem uma operação acontecendo e querem melhorar a geração e o aproveitamento de novas oportunidades.",
        blocks: [
          { t: "p", text: "Pode fazer sentido para empresas que:" },
          {
            t: "list",
            items: [
              "Já vendem e querem criar uma fonte maior de novas oportunidades",
              "Dependem muito de indicação",
              "Já investem em anúncios, mas possuem pouca clareza dos resultados",
              "Possuem vendedores ou atendimento comercial",
              "Vendem diretamente por uma loja virtual",
              "Já contrataram agência anteriormente",
              "Estão recebendo leads, mas sentem dificuldade para transformar esses contatos em vendas",
              "Querem acompanhar marketing e comercial com mais clareza",
            ],
          },
        ],
      },
      {
        kind: "content",
        id: "o_que_nao_fazemos",
        heading: "Não prometemos uma quantidade de vendas antes de entender sua operação.",
        blocks: [
          { t: "p", text: "O resultado depende de vários pontos." },
          {
            t: "flow",
            variant: "chips",
            items: [
              "Produto.",
              "Preço.",
              "Mercado.",
              "Concorrência.",
              "Investimento.",
              "Atendimento.",
              "Equipe.",
              "Oferta.",
              "Processo comercial.",
            ],
          },
          {
            t: "strong",
            text: "Por isso, nossa primeira conversa existe justamente para entender se há cenário para o trabalho.",
          },
        ],
      },
      {
        kind: "faq",
        id: "faq",
        heading: "Perguntas frequentes",
        items: [
          {
            q: "A RCO é uma agência de tráfego?",
            a: [
              "O tráfego pago faz parte do serviço, mas nosso acompanhamento não termina nos anúncios.",
              "Também buscamos entender a qualidade das oportunidades e o que acontece no processo de venda.",
            ],
          },
          {
            q: "Preciso ter uma equipe comercial?",
            a: [
              "Não em todos os casos.",
              "Empresas que vendem diretamente pela internet possuem uma operação diferente das empresas que dependem de vendedores.",
              "Analisamos cada cenário de acordo com a forma como a venda acontece.",
            ],
          },
          {
            q: "Vocês atendem loja virtual?",
            a: [
              "Sim.",
              "Para lojas virtuais, o trabalho fica mais concentrado nas campanhas, comportamento de compra e vendas realizadas no site.",
            ],
          },
          {
            q: "Vocês atendem empresas que vendem pelo WhatsApp?",
            a: [
              "Sim.",
              "Nesse caso, além das campanhas, conseguimos trabalhar o acompanhamento das oportunidades dentro do processo comercial.",
            ],
          },
          {
            q: "Preciso usar o CRM da RCO?",
            a: [
              "Isso depende da estrutura definida para a operação.",
              "Quando o CRM faz sentido para organizar e acompanhar os leads, ele pode fazer parte do trabalho.",
            ],
          },
          {
            q: "Vocês fazem as vendas pelo meu time?",
            a: [
              "Não.",
              "O vendedor ou responsável comercial da empresa continua conduzindo a negociação e realizando o fechamento.",
              "Nós acompanhamos o processo e orientamos melhorias quando necessário.",
            ],
          },
          {
            q: "Já tenho uma agência. Posso conversar mesmo assim?",
            a: [
              "Sim.",
              "A conversa inicial serve para entender sua estrutura atual e identificar se existe algum cenário em que a RCO possa contribuir.",
            ],
          },
          {
            q: "Já tive problema com outras agências. O que muda?",
            a: [
              "Nosso trabalho busca conectar a geração das oportunidades com informações do que acontece depois.",
              "Isso permite discutir campanha e comercial dentro da mesma análise, quando o modelo de venda da empresa exige isso.",
            ],
          },
          {
            q: "Em quanto tempo aparecem resultados?",
            a: [
              "Não existe um prazo único.",
              "O cenário muda conforme empresa, mercado, verba disponível, oferta, estrutura comercial e ponto de partida.",
              "Nosso time pode explicar melhor o que faz sentido esperar depois de analisar sua operação.",
            ],
          },
          {
            q: "Quanto custa?",
            a: [
              "O investimento depende da estrutura necessária para a empresa.",
              "Depois de entender o cenário, nosso time apresenta a proposta adequada ao trabalho que será realizado.",
            ],
          },
        ],
      },
      {
        kind: "cta",
        id: "chamada_final",
        heading:
          "Antes de colocar mais dinheiro em anúncios, descubra se o problema está em gerar oportunidades ou em aproveitar as que já chegam.",
        blocks: [
          { t: "p", text: "Preencha seus dados." },
          {
            t: "p",
            text: "Nosso time vai entender seu cenário e conversar com você sobre a operação atual da sua empresa.",
          },
        ],
        cta: "Quero falar com a RCO",
      },
    ],
  },
};

export function pageMeta(id: PageId) {
  const p = PAGES[id];
  return { id: p.id, formId: p.formId, formName: p.formName };
}
