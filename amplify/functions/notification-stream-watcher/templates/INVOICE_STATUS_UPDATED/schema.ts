import * as Yup from 'yup';
import { DeliveryType, InvoiceSourceType, InvoiceStatus } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  invoiceNumber: Yup.string().required(),
  newInvoiceStatus: Yup.string().oneOf(Object.values(InvoiceStatus)).required("O novo estado da fatura é obrigatório."),
  invoiceSubTotal: Yup.number().required(),
  invoiceDiscount: Yup.number().min(0).optional().default(0),
  invoiceTotalTax: Yup.number().min(0).optional().default(0),
  totalDeliveryFee: Yup.number().min(0).optional().default(0),
  invoiceTotalAmount: Yup.number().required(),
  invoiceSourceType: Yup.string().oneOf(Object.values(InvoiceSourceType)).required(),
  invoiceDueDate: Yup.date().optional(),
  paymentOrActionDate: Yup.date().optional(),
  contractNumber: Yup.string().when('invoiceSourceType', {
    is: InvoiceSourceType.CONTRACT,
    then: (schema) => schema.required('Contract number is required for contract invoices.'),
    otherwise: (schema) => schema.optional(),
  }),
  serviceName: Yup.string().when('invoiceSourceType', {
    is: InvoiceSourceType.CONTRACT,
    then: (schema) => schema.required("Service name is required for contract invoices."),
    otherwise: (schema) => schema.optional(),
  }),
  professionalName: Yup.string().when('invoiceSourceType', {
    is: InvoiceSourceType.CONTRACT,
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.optional(),
  }),
  orderNumber: Yup.string().when('invoiceSourceType', {
    is: InvoiceSourceType.MEDICINE_ORDER,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.optional(),
  }),
  pharmacyName: Yup.string().when('invoiceSourceType', {
    is: InvoiceSourceType.MEDICINE_ORDER,
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.optional(),
  }),
  deliveryType: Yup.string().oneOf(Object.values(DeliveryType)).when('invoiceSourceType', {
    is: InvoiceSourceType.MEDICINE_ORDER,
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.optional(),
  }),
  failureReason: Yup.string().optional(),
  amountPaid: Yup.number().optional(),
  remainingBalance: Yup.number().optional(),
  refundedAmount: Yup.number().optional(),
  invoiceDocumentUrl: Yup.string().url().optional(),
});

export interface TemplateData {
  recipientName: string;
  invoiceNumber: string;
  newInvoiceStatus: InvoiceStatus;
  invoiceSubTotal: number;
  invoiceDiscount: number;
  invoiceTotalTax: number;
  totalDeliveryFee: number;
  invoiceTotalAmount: number;
  invoiceSourceType: InvoiceSourceType;
  invoiceDueDate?: string;
  paymentOrActionDate?: string;
  contractNumber?: string;
  serviceName?: string;
  professionalName?: string;
  orderNumber?: string;
  pharmacyName?: string;
  deliveryType?: DeliveryType;
  failureReason?: string;
  amountPaid?: number;
  remainingBalance?: number;
  refundedAmount?: number;
  invoiceDocumentUrl?: string;
}
