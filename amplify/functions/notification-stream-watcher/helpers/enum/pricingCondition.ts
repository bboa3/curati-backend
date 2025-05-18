import { PricingCondition } from "../../../helpers/types/schema";

const PRICING_CONDITION_DESCRIPTIONS = new Map<PricingCondition, string>([
  [PricingCondition.STANDARD, 'Preço Padrão'],
  [PricingCondition.MONTHLY_SUBSCRIPTION, 'Preço de Assinatura Mensal'],
  [PricingCondition.ANNUAL_SUBSCRIPTION, 'Preço de Assinatura Anual'],
  [PricingCondition.EMERGENCY_SURCHARGE, 'Taxa de Emergência'],
  [PricingCondition.COMPLEXITY_FEE, 'Taxa de Complexidade'],
  [PricingCondition.AFTER_HOURS_FEE, 'Taxa de Hora Extra'],
  [PricingCondition.WEEKEND_FEE, 'Taxa de Fim de Semana'],
  [PricingCondition.SPECIAL_EQUIPMENT_FEE, 'Taxa de Equipamento Especial'],
  [PricingCondition.PROMOTIONAL_DISCOUNT, 'Desconto Promocional'],
  [PricingCondition.CANCELLATION_FEE, 'Taxa de Cancelamento'],
]);


export const convertPricingCondition = (type: PricingCondition): string => {
  return PRICING_CONDITION_DESCRIPTIONS.get(type) || '';
};
