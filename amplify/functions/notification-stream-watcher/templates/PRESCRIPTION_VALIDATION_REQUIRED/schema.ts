import * as Yup from 'yup';

export const TemplateValidatorSchema = Yup.object().shape({
  prescriptionNumber: Yup.string().required(),
  patientName: Yup.string().optional(),
});

export interface TemplateData {
  prescriptionNumber: string;
  patientName: string;
}
