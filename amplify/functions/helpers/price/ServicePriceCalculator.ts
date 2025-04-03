import { BusinessServicePricing, PricingCondition } from "../types/schema";

interface ICalculateServiceTotal {
  businessServicePricing: BusinessServicePricing[];
  appliedPricingConditions: PricingCondition[];
}

interface IServiceTotalOrder {
  subTotal: number;
  totalAdditionalFees: number;
  discount: number;
  taxes: number;
  totalAmount: number;
}

class ServicePriceCalculator {
  taxPercentage: number;

  constructor() {
    this.taxPercentage = 0.0;
  }

  calculateBasePrice(pricings: BusinessServicePricing[], appliedPricingConditions: PricingCondition[]): number {
    let basePrice = 0;
    pricings.forEach(pricing => {
      if (appliedPricingConditions.includes(pricing.condition) && !this.isAdditionalCharge(pricing.condition) && !this.isDiscount(pricing.condition)) {
        basePrice += pricing.fee;
      }
    });
    return basePrice;
  }

  calculateAdditionalFees(pricings: BusinessServicePricing[], appliedPricingConditions: PricingCondition[]): number {
    let additionalFees = 0;
    pricings.forEach(pricing => {
      if (appliedPricingConditions.includes(pricing.condition) && this.isAdditionalCharge(pricing.condition)) {
        additionalFees += pricing.fee;
      }
    });
    return additionalFees;
  }

  calculateDiscounts(pricings: BusinessServicePricing[], appliedPricingConditions: PricingCondition[]): number {
    let discount = 0;
    pricings.forEach(pricing => {
      if (appliedPricingConditions.includes(pricing.condition) && this.isDiscount(pricing.condition)) {
        discount += pricing.fee;
      }
    });
    return discount;
  }

  calculateItemTax(total_price: number): number {
    return (total_price * this.taxPercentage) / 100;
  }

  isAdditionalCharge(condition: PricingCondition): boolean {
    return condition === PricingCondition.ADDITIONAL_AFTER_HOURS ||
      condition === PricingCondition.ADDITIONAL_WEEKEND ||
      condition === PricingCondition.ADDITIONAL_SPECIAL_EQUIPMENT;
  }

  isDiscount(condition: PricingCondition): boolean {
    return condition === PricingCondition.MONTHLY_DISCOUNTED ||
      condition === PricingCondition.SEMI_ANNUALLY_DISCOUNTED ||
      condition === PricingCondition.ANNUALLY_DISCOUNTED ||
      condition === PricingCondition.CANCELLATION;
  }

  calculateServiceTotal({ businessServicePricing, appliedPricingConditions }: ICalculateServiceTotal): IServiceTotalOrder {
    const basePrice = this.calculateBasePrice(businessServicePricing, appliedPricingConditions);
    const additionalFees = this.calculateAdditionalFees(businessServicePricing, appliedPricingConditions);
    const discount = this.calculateDiscounts(businessServicePricing, appliedPricingConditions);

    const subTotal = basePrice + additionalFees - discount;
    const taxes = this.calculateItemTax(subTotal);
    const totalAmount = subTotal + taxes;


    return {
      subTotal: basePrice,
      totalAdditionalFees: additionalFees,
      discount: discount,
      taxes: taxes,
      totalAmount: totalAmount
    };
  }
}

export default ServicePriceCalculator;
