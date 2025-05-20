import * as Yup from 'yup';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  deliveryNumber: Yup.string().required(),
  offerExpiryInfo: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  deliveryNumber: string;
  offerExpiryInfo: string;
}
