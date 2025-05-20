import * as Yup from 'yup';
import { InvoiceSourceType, InvoiceStatus, PaymentTermsType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  invoiceNumber: Yup.string().required(),
  invoiceCreatedAt: Yup.date().required(),
  invoiceDueDate: Yup.date().required(),
  invoiceStatus: Yup.string().oneOf(Object.values(InvoiceStatus)).required(),
  invoiceSubTotal: Yup.number().required(),
  invoiceDiscount: Yup.number().min(0).optional().default(0),
  invoiceTotalTax: Yup.number().min(0).optional().default(0),
  invoiceTotalAmount: Yup.number().required(),
  invoiceSourceType: Yup.string().oneOf(Object.values(InvoiceSourceType)).required(),
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
  totalDeliveryFee: Yup.number().min(0).optional().default(0).when('invoiceSourceType', {
    is: InvoiceSourceType.MEDICINE_ORDER,
    then: (schema) => schema.min(0),
    otherwise: (schema) => schema.optional(),
  }),
  paymentTerms: Yup.string().oneOf(Object.values(PaymentTermsType)).optional(),
  invoiceDocumentUrl: Yup.string().url().optional(),
});

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
