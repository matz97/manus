export type Convenio =
  | "particular"
  | "unimed"
  | "sulamerica"
  | "bradesco"
  | "amil"
  | "outro";

export type CanalPreferido =
  | "whatsapp"
  | "email"
  | "telefone"
  | "instagram"
  | "facebook";

export type StatusPaciente = "ativo" | "inativo";

export interface Patient {
  /** Nome completo do paciente */
  nome_completo: string;

  /** Email do paciente */
  email?: string;

  /** Telefone do paciente */
  telefone: string;

  /** CPF do paciente */
  cpf?: string;

  /** Data de nascimento (formato ISO: yyyy-MM-dd) */
  data_nascimento?: string;

  /** Endereço do paciente */
  endereco?: string;

  /** Convênio médico */
  convenio?: Convenio;

  /** Observações adicionais */
  observacoes?: string;

  /** Canais preferidos de contato */
  canais_preferidos?: CanalPreferido[];

  /** Status do paciente */
  status?: StatusPaciente; // default: "ativo"
}
