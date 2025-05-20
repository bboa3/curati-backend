import * as Yup from 'yup';
import { ContractStatus, ContractType, PaymentTermsType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  contractNumber: Yup.string().required(),
  newContractStatus: Yup.string().oneOf(Object.values(ContractStatus)).required(),

  // Service
  serviceName: Yup.string().required(),
  contractType: Yup.string().oneOf(Object.values(ContractType)).required(),
  professionalName: Yup.string().optional(),

  // Contract
  contractSubmissionDate: Yup.string().required(),
  statusUpdateDate: Yup.string().required(),
  contractStartDate: Yup.string().optional(),
  nextRenewalDate: Yup.string().optional(),

  // Payment
  invoiceNumber: Yup.string().optional(),
  invoiceTotalAmount: Yup.number().optional(),
  invoiceDueDate: Yup.string().optional(),
  paymentTerms: Yup.string().oneOf(Object.values(PaymentTermsType)).optional(),

  // Termination
  terminationReason: Yup.string().optional(),
  terminatedBy: Yup.string().optional(),
  rejectionReason: Yup.string().optional(),
  additionalMessage: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  contractNumber: string;
  newContractStatus: ContractStatus;
  serviceName: string;
  contractType: ContractType;
  professionalName: string;
  contractSubmissionDate: string;
  statusUpdateDate: string;
  contractStartDate: string;
  nextRenewalDate: string;
  invoiceNumber?: string;
  invoiceTotalAmount?: number;
  invoiceDueDate?: string;
  paymentTerms: PaymentTermsType;
  terminationReason?: string;
  terminatedBy?: string;
  rejectionReason?: string;
  additionalMessage?: string;
}
