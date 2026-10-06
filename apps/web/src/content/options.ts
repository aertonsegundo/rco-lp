// ============================================================
// OPÇÕES DO FORMULÁRIO (conteúdo provisório: a RCO define as finais).
//
// Estes valores são gravados como TEXTO nos campos personalizados "Nicho" e
// "Faturamento" do COMERCIAL-RCO. Mudar a lista aqui não exige mudar nada
// lá: os campos são de texto livre. O servidor só aceita o que está nesta lista.
// ============================================================

export const NICHOS = [
  "Estética e beleza",
  "Odontologia",
  "Saúde e clínicas",
  "Advocacia",
  "Educação e cursos",
  "E-commerce",
  "Serviços locais",
  "Outro",
] as const;

export const FATURAMENTOS = [
  "Ainda não faturo",
  "Até R$ 30 mil por mês",
  "De R$ 30 mil a R$ 100 mil por mês",
  "De R$ 100 mil a R$ 300 mil por mês",
  "Acima de R$ 300 mil por mês",
] as const;
