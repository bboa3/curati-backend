import * as Yup from 'yup';
import { AppointmentType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  professionalName: Yup.string().required(),
  appointmentDateTime: Yup.date().required(),
  appointmentType: Yup.string().oneOf(Object.values(AppointmentType)).required(),
});

export interface TemplateData {
  recipientName: string;
  professionalName: string;
  appointmentDateTime: string;
  appointmentType: AppointmentType;
}
