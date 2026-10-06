import type { RespondiBody } from "../respondi";

export type OutboxStatus = "pending" | "sent" | "failed";

export interface OutboxItem {
  /** = respondent_id. Único: é a chave de idempotência da fila inteira. */
  id: string;
  /** "P04" | "P05": decide qual token usar na entrega. */
  page: string;
  status: OutboxStatus;
  payload: RespondiBody;
  createdAt: string;
  attempts: number;
  lastAttemptAt: string | null;
  /** Só faz sentido em `pending`. */
  nextAttemptAt: string | null;
  lastError: string | null;
  sentAt: string | null;
  /** Último retorno do COMERCIAL (sem o token). */
  crm: { httpStatus?: number; body?: unknown; duplicate?: boolean; warning?: string } | null;
}
