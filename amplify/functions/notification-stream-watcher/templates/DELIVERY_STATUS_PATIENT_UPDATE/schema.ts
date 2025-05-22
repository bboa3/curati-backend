import * as Yup from 'yup';
import { DeliveryStatus } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  deliveryNumber: Yup.string().required(),
  orderNumber: Yup.string().required(),
  newDeliveryStatus: Yup.string().oneOf(Object.values(DeliveryStatus)).required(),
  pharmacyName: Yup.string().required(),
  pharmacyAddressSnippet: Yup.string().required(),
  driverName: Yup.string().optional(),
  actionTimestamp: Yup.string().optional(),
  estimatedDeliveryDurationMinutes: Yup.number().positive().optional(),
  cancellationReason: Yup.string().optional(),
  failureReason: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  deliveryNumber: string;
  orderNumber: string;
  newDeliveryStatus: DeliveryStatus;
  pharmacyName: string;
  pharmacyAddressSnippet: string;
  driverName?: string;
  actionTimestamp?: string;
  estimatedDeliveryDurationMinutes?: number;
  cancellationReason?: string;
  failureReason?: string;
}
