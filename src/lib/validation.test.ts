import { describe, expect, it } from "vitest";
import { NICHES } from "../formulario/config";
import { emptyForm, firstInvalidStep, validateStep, type FormData } from "./validation";

const ok: FormData = {
  full_name: "Maria da Silva",
  whatsapp: "(62) 99876-5432",
  whatsapp_confirmed: true,
  niche: "servicos",
  niche_other: "",
  revenue_range: "ate_10k",
};
const types = (step: number, over: Partial<FormData>) => validateStep(step, { ...ok, ...over }).map((e) => e.type);

describe("validação por etapa", () => {
  it("nome: vazio/só espaços rejeitado, 1 letra inválido, válido aceito", () => {
    expect(types(1, { full_name: "   " })).toEqual(["missing_name"]);
    expect(types(1, { full_name: "A" })).toEqual(["invalid_name"]);
    expect(types(1, {})).toEqual([]);
  });

  it("whatsapp: vazio e inválido", () => {
    expect(types(1, { whatsapp: "" })).toEqual(["missing_whatsapp"]);
    expect(types(1, { whatsapp: "(62) 1234" })).toEqual(["invalid_whatsapp"]);
  });

  it("etapa 1 devolve os erros na ordem da tela", () => {
    expect(validateStep(1, emptyForm()).map((e) => e.field)).toEqual(["full_name", "whatsapp"]);
  });

  it("confirmação: não confirmado bloqueia; confirmado passa", () => {
    expect(types(2, { whatsapp_confirmed: false })).toEqual(["whatsapp_not_confirmed"]);
    expect(types(2, {})).toEqual([]);
  });

  it("nicho e faturamento obrigatórios; Outro exige o texto", () => {
    expect(types(3, { niche: "", revenue_range: "" })).toEqual(["missing_niche", "missing_revenue_range"]);
    expect(types(3, { niche: "outro", niche_other: " " })).toEqual(["missing_niche_other"]);
    expect(types(3, { niche: "outro", niche_other: "Pet shop" })).toEqual([]);
  });

  it("'Outro' está disponível e é a última opção", () => {
    expect(NICHES.at(-1)).toEqual({ value: "outro", label: "Outro" });
  });

  it("firstInvalidStep aponta a primeira etapa com problema", () => {
    expect(firstInvalidStep(ok)).toBeNull();
    expect(firstInvalidStep({ ...ok, whatsapp_confirmed: false })).toBe(2);
    expect(firstInvalidStep({ ...ok, full_name: "" })).toBe(1);
  });
});
