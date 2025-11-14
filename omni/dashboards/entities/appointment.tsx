export type Especialidade =
  | "cardiologia"
  | "dermatologia"
  | "ortopedia"
  | "pediatria"
  | "ginecologia"
  | "oftalmologia"
  | "neurologia"
  | "clinico_geral"
  | "outro";

export type StatusAgendamento =
  | "agendado"
  | "confirmado"
  | "cancelado"
  | "realizado"
  | "faltou";

export type TipoConsulta = "primeira_vez" | "retorno" | "exame";

export interface Appointment {
  /** ID do paciente */
  patient_id?: string;

  /** Nome do paciente (obrigatório) */
  patient_name: string;

  /** Especialidade da consulta (obrigatório) */
  especialidade: Especialidade;

  /** Nome do médico */
  medico?: string;

  /** Data e hora da consulta (ISO date-time, obrigatório) */
  data_hora: string;

  /** Duração em minutos (default: 30) */
  duracao?: number;

  /** Status do agendamento (default: "agendado") */
  status?: StatusAgendamento;

  /** Tipo da consulta */
  tipo_consulta?: TipoConsulta;

  /** Convênio médico */
  convenio?: string;

  /** Observações adicionais */
  observacoes?: string;

  /** Se lembrete foi enviado (default: false) */
  lembrete_enviado?: boolean;

  /** Se paciente confirmou (default: false) */
  confirmado_pelo_paciente?: boolean;
}
