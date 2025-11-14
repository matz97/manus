export type Remetente = "paciente" | "atendente" | "sistema";

export type TipoMensagem = "texto" | "imagem" | "arquivo" | "audio" | "video";

export interface Message {
  /** ID da conversa (obrigatório) */
  conversation_id: string;

  /** Quem enviou a mensagem (obrigatório) */
  remetente: Remetente;

  /** Nome do remetente */
  remetente_nome?: string;

  /** Conteúdo da mensagem (obrigatório) */
  conteudo: string;

  /** Tipo da mensagem (default: "texto") */
  tipo?: TipoMensagem;

  /** URL do arquivo (se tipo for imagem/arquivo/audio/video) */
  arquivo_url?: string;

  /** Se a mensagem foi lida (default: false) */
  lida?: boolean;

  /** Data/hora da leitura (ISO date-time) */
  data_leitura?: string;
}
