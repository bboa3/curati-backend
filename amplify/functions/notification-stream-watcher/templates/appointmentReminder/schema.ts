import * as Yup from 'yup';
import { AppointmentParticipantType, AppointmentType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  otherPartyName: Yup.string().required(),
  recipientType: Yup.string().oneOf(Object.values(AppointmentParticipantType)).required(),
  appointmentNumber: Yup.string().required(),
  appointmentDateTime: Yup.date().required(),
  appointmentType: Yup.string().oneOf(Object.values(AppointmentType)).required(),
  purpose: Yup.string().required(),
  reminderTimingText: Yup.string().required(), // e.g., "Amanhã", "Hoje", "Em 1 hora", "Em 30 minutos"
  specificActionInstruction: Yup.string().optional(), // e.g., "Dirija-se ao local.", "Prepare-se para a ligação." - derived from old logic
  locationName: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  otherPartyName: string;
  recipientType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string;
  appointmentType: AppointmentType;
  purpose: string;
  reminderTimingText: string;
  specificActionInstruction: string;
  locationName: string;
}
