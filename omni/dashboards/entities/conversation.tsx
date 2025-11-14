export type Canal =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "email"
  | "chat"
  | "telefone";

export type StatusConversa =
  | "aguardando"
  | "em_atendimento"
  | "resolvido"
  | "pendente";

export type Prioridade = "baixa" | "media" | "alta" | "urgente";

export interface Conversation {
  /** ID do paciente */
  patient_id?: string;

  /** Nome do paciente (obrigatório) */
  patient_name: string;

  /** Canal de origem da conversa (obrigatório) */
  canal: Canal;

  /** Status da conversa (default: "aguardando") */
  status?: StatusConversa;

  /** Prioridade da conversa (default: "media") */
  prioridade?: Prioridade;

  /** ID do atendente responsável */
  atendente_id?: string;

  /** Nome do atendente */
  atendente_nome?: string;

  /** Assunto da conversa */
  assunto?: string;

  /** Última mensagem registrada */
  ultima_mensagem?: string;

  /** Data/hora da última mensagem (ISO date-time) */
  data_ultima_mensagem?: string;

  /** Tempo em minutos até primeira resposta */
  tempo_primeira_resposta?: number;

  /** Tempo total em minutos até resolução */
  tempo_resolucao?: number;

  /** Tags associadas à conversa */
  tags?: string[];

  /** Avaliação de satisfação do paciente (1–5) */
  satisfacao?: number;
}
