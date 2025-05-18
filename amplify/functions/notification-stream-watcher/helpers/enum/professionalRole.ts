import { ProfessionalRole } from "../../../helpers/types/schema";


const PROFESSIONAL_ROLE_DESCRIPTIONS = new Map<ProfessionalRole, string>([
  [ProfessionalRole.MANAGER, 'Gerente'],
  [ProfessionalRole.ASSISTANT, 'Assistente'],
  [ProfessionalRole.STAFF, 'Funcionario'],
  [ProfessionalRole.INTERN, 'Estagiário'],
  [ProfessionalRole.OWNER, 'Proprietario'],
]);

export const convertProfessionalRole = (type: ProfessionalRole): string => {
  return PROFESSIONAL_ROLE_DESCRIPTIONS.get(type) || '';
};
