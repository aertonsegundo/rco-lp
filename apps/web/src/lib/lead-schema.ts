import { createLeadFormSchema, createLeadSchema } from "@rco/lead-core/schema";
import { FATURAMENTOS, NICHOS } from "@/content/options";
import { PAGE_IDS } from "@/content/pages";

// Um único ponto define o que é válido; browser e servidor importam daqui.
const config = { pages: PAGE_IDS, nichos: NICHOS, faturamentos: FATURAMENTOS } as const;

export const leadSchema = createLeadSchema(config);
export const leadFormSchema = createLeadFormSchema(config);
