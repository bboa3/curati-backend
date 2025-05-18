import { Language } from "../../../helpers/types/schema";

const LANGUAGE_DESCRIPTIONS = new Map<Language, string>([
  [Language.PORTUGUESE, 'Português'],
  [Language.ENGLISH, 'Inglês'],
  [Language.TSONGA, 'Tsonga'],
  [Language.CHANGANA, 'Changana'],
  [Language.MAKHUWA, 'Makhuwa'],
  [Language.SENA, 'Sena'],
  [Language.NDAU, 'Ndau'],
]);

export const convertLanguage = (type: Language): string => {
  return LANGUAGE_DESCRIPTIONS.get(type) || '';
};
