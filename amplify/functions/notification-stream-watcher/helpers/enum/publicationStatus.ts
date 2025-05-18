import { PublicationStatus } from "../../../helpers/types/schema";

const PUBLICATION_STATUS_DESCRIPTIONS = new Map<PublicationStatus, string>([
  [PublicationStatus.DRAFT, 'Rascunho'],
  [PublicationStatus.PUBLISHED, 'Publicado'],
  [PublicationStatus.ARCHIVED, 'Arquivado'],
]);

export const convertPublicationStatus = (type: PublicationStatus): string => {
  return PUBLICATION_STATUS_DESCRIPTIONS.get(type) || '';
};
