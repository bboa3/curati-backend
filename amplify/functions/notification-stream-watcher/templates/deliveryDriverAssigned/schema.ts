import * as Yup from 'yup';
import { UserRole } from '../../../helpers/types/schema';

export const TemplateValidatorSchema = Yup.object().shape({
  recipientName: Yup.string().required(),
  recipientType: Yup.string().oneOf(Object.values(UserRole)).required(),
  deliveryNumber: Yup.string().required(),
  driverName: Yup.string().required(),
  deliveryWindowStartTime: Yup.string().required(),
  deliveryWindowEndTime: Yup.string().required(),
  pharmacyName: Yup.string().required(),
  pharmacyAddressSnippet: Yup.string().required(),
  patientGeneralLocationSnippet: Yup.string().required(),
});

export interface TemplateData {
  recipientName: string;
  recipientType: UserRole;
  deliveryNumber: string;
  driverName: string;
  deliveryWindowStartTime: string;
  deliveryWindowEndTime: string;
  pharmacyName: string;
  pharmacyAddressSnippet: string;
  patientGeneralLocationSnippet: string;
}
