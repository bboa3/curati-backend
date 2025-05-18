import * as Yup from 'yup';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  deliveryNumber: Yup.string().required(),
  offerExpiryInfo: Yup.string().optional(), // E.g. "Esta oferta expira em 5 minutos." or "Disponível por tempo limitado."
});

export interface TemplateData {
  recipientName: string;
  deliveryNumber: string;
  offerExpiryInfo: string;
}
