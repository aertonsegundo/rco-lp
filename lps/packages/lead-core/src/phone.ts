// ============================================================
// Telefone brasileiro. Roda no browser (máscara e validação) e no servidor
// (revalidação): o servidor nunca confia na normalização do cliente.
//
// Formato que o COMERCIAL-RCO espera: SÓ DÍGITOS, com DDI 55
// (ex.: 5511999998888). Ele casa contato pelos últimos 8 dígitos, então um
// número sem o 55 ainda casaria, mas quem envia mensagem depois (WhatsApp)
// precisa do número completo.
// ============================================================

/** DDDs em uso no Brasil (Anatel). */
const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44,
  45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81,
  82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

/**
 * Aceita digitação livre ("(11) 99999-8888", "+55 11 99999 8888",
 * "011999998888") e devolve `55` + DDD + número de 9 dígitos, ou `null`.
 *
 * Exige celular (11 dígitos nacionais, começando em 9): é um formulário de
 * WhatsApp, e fixo não recebe. Não "conserta" número de 10 dígitos
 * inserindo um 9, porque isso seria adivinhar o telefone de uma pessoa.
 */
export function normalizeBrPhone(input: string): string | null {
  let d = digitsOnly(input);
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  // Prefixo de operadora/interurbano digitado à mão: 0 + DDD + número.
  if (d.length === 12 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length !== 11) return null;
  if (!DDDS_VALIDOS.has(Number(d.slice(0, 2)))) return null;
  if (d[2] !== "9") return null;
  return `55${d}`;
}

/** Máscara de digitação: "(11) 99999-8888". Tolera número incompleto. */
export function formatBrPhoneInput(input: string): string {
  let d = digitsOnly(input);
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Últimos 4 dígitos, para log sem expor o telefone inteiro. */
export function phoneTail(e164: string): string {
  return `***${e164.slice(-4)}`;
}
