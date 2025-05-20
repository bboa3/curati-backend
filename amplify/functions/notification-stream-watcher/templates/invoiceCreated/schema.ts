import { InvoiceSourceType, InvoiceStatus, PaymentTermsType } from '../../../helpers/types/schema';

export interface TemplateData {
  recipientName: string;
  invoiceNumber: string;
  invoiceCreatedAt: Date;
  invoiceDueDate: Date;
  invoiceStatus: InvoiceStatus;
  invoiceSubTotal: number;
  invoiceDiscount: number;
  invoiceTotalTax: number;
  invoiceTotalAmount: number;
  invoiceSourceType: InvoiceSourceType;
  contractNumber?: string;
  serviceName?: string;
  professionalName?: string;
  orderNumber?: string;
  totalDeliveryFee?: number;
  paymentTerms?: PaymentTermsType;
  invoiceDocumentUrl?: string;
}
