import { InvoiceStatus } from "../../helpers/types/schema";

const INVOICE_STATUS_DESCRIPTIONS = new Map<InvoiceStatus, string>([
  [InvoiceStatus.PENDING, 'Pagamento pendente'],
  [InvoiceStatus.PAID, 'Pago'],
  [InvoiceStatus.PARTIALLY_PAID, 'Parcialmente Pago'],
  [InvoiceStatus.FAILED, 'Pagamento falhou'],
  [InvoiceStatus.OVERDUE, 'Vencido'],
]);

export const convertInvoiceStatus = (type: InvoiceStatus): string => {
  return INVOICE_STATUS_DESCRIPTIONS.get(type) || '';
};
