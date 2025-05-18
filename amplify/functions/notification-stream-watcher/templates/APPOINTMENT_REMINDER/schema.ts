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
  reminderTimingText: Yup.string().optional(),
  locationName: Yup.string().optional(),
  additionalInstructions: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  otherPartyName: string;
  recipientType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string;
  appointmentType: AppointmentType;
  purpose: string;
  reminderTimingText?: string;
  locationName?: string;
  additionalInstructions?: string;
}
