import { describe, expect, it } from "vitest";
import { formatBrPhoneInput, normalizeBrPhone, phoneTail } from "./phone";

describe("normalizeBrPhone", () => {
  it.each([
    ["(11) 99999-8888", "5511999998888"],
    ["11999998888", "5511999998888"],
    ["+55 11 99999 8888", "5511999998888"],
    ["55 (21) 98888-7777", "5521988887777"],
    ["011 99999-8888", "5511999998888"],
    ["  (47)9 9123-4567 ", "5547991234567"],
  ])("aceita %s", (input, esperado) => {
    expect(normalizeBrPhone(input)).toBe(esperado);
  });

  it.each([
    ["", "vazio"],
    ["1199999888", "faltou um dígito (10)"],
    ["(11) 3333-4444", "fixo, sem o 9"],
    ["(11) 89999-8888", "não começa com 9"],
    ["(00) 99999-8888", "DDD inexistente"],
    ["(20) 99999-8888", "DDD 20 não existe"],
    ["551199999888877", "longo demais"],
    ["abc", "sem dígitos"],
  ])("recusa %s (%s)", (input) => {
    expect(normalizeBrPhone(input)).toBeNull();
  });

  it("não inventa o nono dígito de um número de 10 dígitos", () => {
    expect(normalizeBrPhone("(11) 9999-8888")).toBeNull();
  });
});

describe("formatBrPhoneInput", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["119", "(11) 9"],
    ["1199999", "(11) 99999"],
    ["11999998", "(11) 99999-8"],
    ["11999998888", "(11) 99999-8888"],
    ["5511999998888", "(11) 99999-8888"],
    ["119999988889999", "(11) 99999-8888"],
  ])("%s → %s", (input, esperado) => {
    expect(formatBrPhoneInput(input)).toBe(esperado);
  });
});

describe("phoneTail", () => {
  it("mostra só os 4 últimos dígitos", () => {
    expect(phoneTail("5511999998888")).toBe("***8888");
  });
});
