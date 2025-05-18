import { ProfessionalAvailabilityStatus } from "../../../helpers/types/schema";

const PROFESSIONAL_AVAILABILITY_DESCRIPTIONS = new Map<ProfessionalAvailabilityStatus, string>([
  [ProfessionalAvailabilityStatus.ONLINE, 'Online'],
  [ProfessionalAvailabilityStatus.OFFLINE, 'Offline'],
  [ProfessionalAvailabilityStatus.ON_BREAK, 'Em pausa'],
  [ProfessionalAvailabilityStatus.BUSY, 'Ocupado'],
]);

export const convertProfessionalAvailabilityStatus = (type: ProfessionalAvailabilityStatus): string => {
  return PROFESSIONAL_AVAILABILITY_DESCRIPTIONS.get(type) || '';
};
