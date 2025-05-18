import * as Yup from 'yup';
import { PrescriptionStatus } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  prescriptionNumber: Yup.string().required(),
  prescriptionStatus: Yup.string().oneOf(Object.values(PrescriptionStatus)).required(),
  statusReason: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  prescriptionNumber: string;
  prescriptionStatus: PrescriptionStatus;
  statusReason: string;
}
