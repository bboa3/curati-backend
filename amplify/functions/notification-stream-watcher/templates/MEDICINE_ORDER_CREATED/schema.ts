import * as Yup from 'yup';
import { DeliveryType, UserRole } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  recipientRole: Yup.string().oneOf(Object.values(UserRole)).required(),
  orderNumber: Yup.string().required(),
  orderDate: Yup.string().required(),
  patientName: Yup.string().optional(),
  pharmacyName: Yup.string().required(),
  itemCount: Yup.number().positive().optional(),
  itemsSnippet: Yup.string().optional(),
  deliveryType: Yup.string().oneOf(Object.values(DeliveryType)).required(),
  orderValue: Yup.string().optional(),
});

export interface TemplateData {
  recipientName: string;
  recipientRole: UserRole;
  orderNumber: string;
  orderDate: string;
  patientName?: string;
  pharmacyName: string;
  itemCount?: number;
  itemsSnippet?: string;
  deliveryType: DeliveryType;
  orderValue?: string;
}
