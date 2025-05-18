import { PhysicalActivityLevel } from "../../../helpers/types/schema";

const PHYSICAL_ACTIVITY_LEVEL_DESCRIPTIONS = new Map<PhysicalActivityLevel, string>([
  [PhysicalActivityLevel.SEDENTARY, 'Sedentario'],
  [PhysicalActivityLevel.LIGHT, 'Leve'],
  [PhysicalActivityLevel.MODERATE, 'Moderado'],
  [PhysicalActivityLevel.ACTIVE, 'Ativo'],
  [PhysicalActivityLevel.VERY_ACTIVE, 'Muito Ativo'],
]);

export const convertPhysicalActivityLevel = (type: PhysicalActivityLevel): string => {
  return PHYSICAL_ACTIVITY_LEVEL_DESCRIPTIONS.get(type) || '';
};
