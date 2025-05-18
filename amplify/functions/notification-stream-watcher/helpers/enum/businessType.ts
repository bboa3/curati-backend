import { BusinessType } from '../../../helpers/types/schema';

const BUSINESS_TYPE_DESCRIPTIONS = new Map<BusinessType, string>([
  [BusinessType.PHARMACY, 'Farmácia'],
  [BusinessType.HOSPITAL, 'Hospital'],
  [BusinessType.DELIVERY, 'Entrega'],
  [BusinessType.LABORATORY, 'Laboratório'],
]);

export const convertBusinessType = (type: BusinessType): string => {
  return BUSINESS_TYPE_DESCRIPTIONS.get(type) || '';
};
