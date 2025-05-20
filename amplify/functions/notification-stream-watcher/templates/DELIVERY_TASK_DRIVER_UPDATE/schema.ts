import * as Yup from 'yup';
import { DeliveryStatus } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  deliveryNumber: Yup.string().required(),
  orderNumber: Yup.string().required(),
  newDeliveryStatus: Yup.string().oneOf(Object.values(DeliveryStatus)).required(),
  pharmacyName: Yup.string().optional(),
  patientNameForContext: Yup.string().optional(),
  patientAddressSnippet: Yup.string().optional(),
  pharmacyAddressSnippet: Yup.string().required(),
  actionTimestamp: Yup.date().optional(),
  statusReason: Yup.string().optional(),
  nextStepInstruction: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  deliveryNumber: string;
  orderNumber: string;
  newDeliveryStatus: DeliveryStatus;
  pharmacyName: string;
  patientNameForContext: string;
  patientAddressSnippet: string;
  pharmacyAddressSnippet: string;
  actionTimestamp: Date;
  statusReason: string;
  nextStepInstruction: string;
}
