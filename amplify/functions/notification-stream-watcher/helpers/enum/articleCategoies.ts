import { ArticleCategory } from "../../../helpers/types/schema";

const ARTICLE_CATEGORY_DESCRIPTIONS = new Map<ArticleCategory, string>([
  [ArticleCategory.HEALTH_AND_WELLNESS, 'Saúde e bem-estar'],
  [ArticleCategory.NUTRITION, 'Nutrição'],
  [ArticleCategory.FITNESS, 'Fisica'],
  [ArticleCategory.MENTAL_HEALTH, 'Saúde Mental'],
  [ArticleCategory.MEDICAL_RESEARCH, 'Pesquisa Medicina'],
  [ArticleCategory.HEALTHCARE_POLICY, 'Politica de Saúde'],
  [ArticleCategory.PATIENT_STORIES, 'Historias de pacientes'],
  [ArticleCategory.PREVENTION, 'Prevenção'],
  [ArticleCategory.LIFESTYLE, 'Estilo de vida'],
]);

export const convertArticleCategory = (type: ArticleCategory): string => {
  return ARTICLE_CATEGORY_DESCRIPTIONS.get(type) || '';
};
