import { BusinessServicePricing } from "../../../functions/helpers/types/schema";

export const groupPricingByService = (
  pricing: BusinessServicePricing[]
): Map<string, BusinessServicePricing[]> => {
  return pricing.reduce((map, p) => {
    const serviceId = p.businessServiceId;
    map.set(serviceId, [...(map.get(serviceId) || []), p]);
    return map;
  }, new Map<string, BusinessServicePricing[]>());
};