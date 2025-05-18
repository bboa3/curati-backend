import { PrescriptionType } from "../../../helpers/types/schema";

const PRESCRIPTION_TYPE_DESCRIPTIONS = new Map<PrescriptionType, string>([
  [PrescriptionType.INPATIENT, 'In-patient'],
  [PrescriptionType.OUTPATIENT, 'Out-patient'],
]);

export const convertPrescriptionType = (type: PrescriptionType): string => {
  return PRESCRIPTION_TYPE_DESCRIPTIONS.get(type) || '';
};
