import * as Yup from 'yup';
import { ContractStatus, ContractType } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  contractNumber: Yup.string().required(),
  newContractStatus: Yup.string().oneOf(Object.values(ContractStatus)).required(),

  serviceName: Yup.string().required(),
  contractType: Yup.string().oneOf(Object.values(ContractType)).required(),
  patientName: Yup.string().required(),

  statusUpdateDate: Yup.date().required(),
  contractStartDate: Yup.date().optional(),
  contractEndDate: Yup.date().optional(),
  confirmationDueDate: Yup.date().optional(),

  // For TERMINATED status
  terminationReason: Yup.string().optional(),
  terminatedBy: Yup.string().optional(),

  // For REJECTED status
  rejectionReason: Yup.string().optional(),

  additionalMessage: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  contractNumber: string;
  newContractStatus: ContractStatus;
  serviceName: string;
  contractType: ContractType;
  patientName: string;
  statusUpdateDate: string;
  contractStartDate?: string;
  contractEndDate: string;
  confirmationDueDate: string;
  terminationReason: string;
  terminatedBy: string;
  rejectionReason: string;
  additionalMessage: string;
}
