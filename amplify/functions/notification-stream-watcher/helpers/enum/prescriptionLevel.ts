import { PrescriptionLevel } from "../../../helpers/types/schema";

const PRESCRIPTION_LEVEL_DESCRIPTIONS = new Map<PrescriptionLevel, string>([
  [PrescriptionLevel.GENERAL_AGENT, 'Agente Geral de Saúde (0)'],
  [PrescriptionLevel.COMMUNITY_HEALTH_AGENT, 'Agente de Saúde Comunitária (1)'],
  [PrescriptionLevel.GENERAL_MEDICAL_TECHNICIAN, 'Técnico Geral de Saúde (2)'],
  [PrescriptionLevel.GENERAL_PRACTITIONER, 'Médico Generalista (3)'],
  [PrescriptionLevel.SPECIALIST, 'Médico Especialista (4)'],
]);

export const convertPrescriptionLevel = (level: PrescriptionLevel): string => {
  return PRESCRIPTION_LEVEL_DESCRIPTIONS.get(level) || '';
};
