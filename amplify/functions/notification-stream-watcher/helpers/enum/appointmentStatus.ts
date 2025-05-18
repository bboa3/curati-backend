import { AppointmentStatus } from "../../../helpers/types/schema";

const APPOINTMENT_STATUS_DESCRIPTIONS = new Map<AppointmentStatus, string>([
  [AppointmentStatus.PENDING_PAYMENT, 'Aguardando pagamento'],
  [AppointmentStatus.PENDING_CONFIRMATION, 'Aguardando confirmação'],
  [AppointmentStatus.CONFIRMED, 'Confirmado'],
  [AppointmentStatus.RESCHEDULED, 'Reagendado'],
  [AppointmentStatus.CANCELLED, 'Cancelado'],
  [AppointmentStatus.COMPLETED, 'Finalizado'],
]);
export const convertAppointmentStatus = (type: AppointmentStatus): string => {
  return APPOINTMENT_STATUS_DESCRIPTIONS.get(type) || '';
};