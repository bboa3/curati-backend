import * as Yup from 'yup';
import { DeliveryStatus } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  deliveryNumber: Yup.string().required(),
  orderNumber: Yup.string().required(),
  eventDeliveryStatus: Yup.string().oneOf(Object.values(DeliveryStatus)).required(),
  eventTimestamp: Yup.string().required(),
  patientName: Yup.string().optional(),
  driverName: Yup.string().required(),
  pharmacyName: Yup.string().required(),
  statusReason: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  deliveryNumber: string;
  orderNumber: string;
  eventDeliveryStatus: DeliveryStatus;
  eventTimestamp: string;
  patientName?: string;
  driverName: string;
  pharmacyName: string;
  statusReason?: string;
}
