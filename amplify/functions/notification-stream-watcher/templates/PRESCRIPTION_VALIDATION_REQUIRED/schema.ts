import * as Yup from 'yup';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  prescriptionNumber: Yup.string().required(),
  patientName: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  prescriptionNumber: string;
  patientName?: string;
}
