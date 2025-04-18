import { BusinessServicePricing, FeeType, PricingCondition } from "../types/schema";

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

  calculateItemTax(total_price: number): number {
    return (total_price * this.taxPercentage) / 100;
  }

  private calculateFeeValue(basePrice: number, pricing: BusinessServicePricing): number {
    switch (pricing.feeType) {
      case FeeType.PERCENTAGE:
        return basePrice * (pricing.fee / 100);
      case FeeType.FIXED:
        return pricing.fee;
      default:
        return 0;
    }
  }

  private isAdditionalCharge(condition: PricingCondition): boolean {
    return [
      PricingCondition.EMERGENCY_SURCHARGE,
      PricingCondition.COMPLEXITY_FEE,
      PricingCondition.AFTER_HOURS_FEE,
      PricingCondition.WEEKEND_FEE,
      PricingCondition.SPECIAL_EQUIPMENT_FEE
    ].includes(condition);
  }

  private isDiscount(condition: PricingCondition): boolean {
    return [
      PricingCondition.MONTHLY_SUBSCRIPTION_DISCOUNT,
      PricingCondition.ANNUAL_SUBSCRIPTION_DISCOUNT,
      PricingCondition.PROMOTIONAL_DISCOUNT
    ].includes(condition);
  }

  calculateServiceTotal({ businessServicePricing, appliedPricingConditions, }: ICalculateServiceTotal): IServiceTotalOrder {
    const standardPricing = businessServicePricing.find(p => p.condition === PricingCondition.STANDARD);

    if (!standardPricing) {
      throw new Error('No STANDARD pricing found');
    }

    let basePrice = standardPricing.fee;
    let additionalFees = 0;
    let discounts = 0;

    appliedPricingConditions
      .filter(c => c !== PricingCondition.STANDARD)
      .forEach(condition => {
        const pricing = businessServicePricing.find(p => p.condition === condition);
        if (!pricing) return;

        if (this.isAdditionalCharge(condition)) {
          additionalFees += this.calculateFeeValue(basePrice, pricing);
        } else if (this.isDiscount(condition)) {
          discounts += this.calculateFeeValue(basePrice, pricing);
        }
      });

    const subTotal = basePrice + additionalFees;
    const discountedTotal = Math.max(subTotal - discounts, 0);
    const taxes = this.calculateItemTax(discountedTotal);
    const totalAmount = discountedTotal + taxes;

    return {
      subTotal: basePrice,
      totalAdditionalFees: additionalFees,
      discount: discounts,
      taxes: taxes,
      totalAmount: totalAmount,
    };
  }
}

export default ServicePriceCalculator;
