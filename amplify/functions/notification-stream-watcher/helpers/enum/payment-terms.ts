import { PaymentTermsType } from "../../../helpers/types/schema";

const PAYMENT_TERMS_TYPE_DESCRIPTIONS = new Map<PaymentTermsType, string>([
  [PaymentTermsType.NET_1, 'Pagamento em 24 horas'],
  [PaymentTermsType.NET_7, 'Pagamento em 7 dias'],
  [PaymentTermsType.NET_30, 'Pagamento em 30 dias'],
]);

export const convertPaymentTermsType = (type: PaymentTermsType): string => {
  return PAYMENT_TERMS_TYPE_DESCRIPTIONS.get(type) || '';
};
