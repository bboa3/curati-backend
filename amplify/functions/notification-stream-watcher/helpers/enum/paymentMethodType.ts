import { PaymentMethodType } from "../../../helpers/types/schema";

const PaymentMethodType_DESCRIPTIONS = new Map<PaymentMethodType, string>([
  [PaymentMethodType.CREDIT_CARD, 'Cartão de crédito'],
  [PaymentMethodType.DEBIT_CARD, 'Cartão de debito'],
  [PaymentMethodType.MOBILE_PAYMENT, 'Pagamento móvel'],
]);

export const convertPaymentMethodType = (type: PaymentMethodType): string => {
  return PaymentMethodType_DESCRIPTIONS.get(type) || '';
};
