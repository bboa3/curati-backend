import { ProfessionalType } from "../../../helpers/types/schema";

const PROFESSIONAL_TYPE_DESCRIPTIONS = new Map<ProfessionalType, string>([
  [ProfessionalType.DOCTOR, 'Médico'],
  [ProfessionalType.NURSE, 'Enfermeiro'],
  [ProfessionalType.PHARMACIST, 'Farmacêutico'],
  [ProfessionalType.DRIVER, 'Motorista'],
]);

export const convertProfessionalType = (type: ProfessionalType): string => {
  return PROFESSIONAL_TYPE_DESCRIPTIONS.get(type) || '';
};
