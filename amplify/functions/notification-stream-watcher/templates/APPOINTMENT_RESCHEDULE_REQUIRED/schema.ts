import * as Yup from 'yup';
import { AppointmentParticipantType, AppointmentType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  reschedulerName: Yup.string().required(),
  reschedulerType: Yup.string().oneOf(Object.values(AppointmentParticipantType)).required(),
  appointmentNumber: Yup.string().required(),
  originalAppointmentDateTime: Yup.date().required(),
  newAppointmentDateTime: Yup.date().required(),
  duration: Yup.number().positive().required(),
  appointmentType: Yup.string().oneOf(Object.values(AppointmentType)).required(),
  purpose: Yup.string().required(),
});

export interface TemplateData {
  recipientName: string;
  reschedulerName: string;
  reschedulerType: AppointmentParticipantType;
  appointmentNumber: string;
  originalAppointmentDateTime: string;
  newAppointmentDateTime: string;
  duration: number;
  appointmentType: AppointmentType;
  purpose: string;
}
