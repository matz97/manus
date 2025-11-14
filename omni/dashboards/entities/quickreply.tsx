export type CategoriaQuickReply =
  | "saudacao"
  | "horario"
  | "agendamento"
  | "documentos"
  | "convenio"
  | "localizacao"
  | "despedida"
  | "outro";

export interface QuickReply {
  /** Título da resposta rápida (obrigatório) */
  titulo: string;

  /** Atalho para usar (ex: /horario) */
  atalho?: string;

  /** Texto da resposta (obrigatório) */
  conteudo: string;

  /** Categoria da resposta */
  categoria?: CategoriaQuickReply;

  /** Se está ativo (default: true) */
  ativo?: boolean;
}
