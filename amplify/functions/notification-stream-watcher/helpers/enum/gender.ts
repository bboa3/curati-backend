import { Gender } from "../../../helpers/types/schema";

const GENDER_DESCRIPTIONS = new Map<Gender, string>([
  [Gender.MALE, 'Masculino'],
  [Gender.FEMALE, 'Feminino'],
  [Gender.OTHER, 'Outro'],
]);

export const convertGender = (type: Gender): string => {
  return GENDER_DESCRIPTIONS.get(type) || '';
};
