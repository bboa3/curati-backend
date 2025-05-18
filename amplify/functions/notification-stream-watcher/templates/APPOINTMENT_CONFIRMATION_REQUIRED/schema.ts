import * as Yup from 'yup';
import { AppointmentParticipantType, AppointmentType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  requesterName: Yup.string().required(),
  requesterType: Yup.string().oneOf(Object.values(AppointmentParticipantType)).required(),
  appointmentNumber: Yup.string().required(),
  appointmentDateTime: Yup.string().required(),
  duration: Yup.number().required(),
  appointmentType: Yup.string().oneOf(Object.values(AppointmentType)).required(),
  purpose: Yup.string().required(),
});

export interface TemplateData {
  recipientName: string;
  requesterName: string;
  requesterType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string;
  duration: number;
  appointmentType: AppointmentType;
  purpose: string;
}
