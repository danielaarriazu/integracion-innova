export type ConsultationStatus = 'nueva' | 'en_proceso' | 'cerrada';
export type ConsultationSender = 'cliente' | 'usuario' | 'bot';

export interface CreateConsultationInput {
  slug: string;
  sessionAnonimaId?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  tipoConsulta?: string;
  prioridad?: string;
  canal?: string;
  asunto?: string;
  descripcion?: string;
}

export interface AddConsultationMessageInput {
  slug: string;
  consultaId: string;
  emisor: ConsultationSender;
  contenido: string;
  tipoMensaje?: string;
}

export interface UpdateConsultationStatusInput {
  usuarioId: string;
  consultaId: string;
  estado: ConsultationStatus;
}
