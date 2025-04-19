import { BusinessServicePricing, FeeType, PricingCondition } from "../types/schema";

interface ICalculateServiceTotal {
  businessServicePricing: BusinessServicePricing[];
  appliedPricingConditions: PricingCondition[];
}

interface IServiceTotalOrder {
  basePrice: number;
  subscriptionType: PricingCondition;
  serviceFees: number;
  discounts: number;
  subtotal: number;
  taxableAmount: number;
  taxes: number;
  totalAmount: number;
}

class ServicePriceCalculator {
  private taxPercentage: number;
  private readonly baseConditions = [
    PricingCondition.STANDARD,
    PricingCondition.MONTHLY_SUBSCRIPTION,
    PricingCondition.ANNUAL_SUBSCRIPTION
  ];

  constructor() {
    this.taxPercentage = 0.0;
  }

  private calculateTaxes(amount: number): number {
    return (amount * this.taxPercentage) / 100;
  }

  private isBaseCondition(condition: PricingCondition): boolean {
    return this.baseConditions.includes(condition);
  }

  private isServiceFee(condition: PricingCondition): boolean {
    return [
      PricingCondition.EMERGENCY_SURCHARGE,
      PricingCondition.COMPLEXITY_FEE,
      PricingCondition.AFTER_HOURS_FEE,
      PricingCondition.WEEKEND_FEE,
      PricingCondition.SPECIAL_EQUIPMENT_FEE
    ].includes(condition);
  }

  private isDiscount(condition: PricingCondition): boolean {
    return condition === PricingCondition.PROMOTIONAL_DISCOUNT;
  }

  private validateBaseConditions(conditions: PricingCondition[]): PricingCondition {
    const baseSelected = conditions.filter(c => this.isBaseCondition(c));

    if (baseSelected.length !== 1) {
      throw new Error('Must select exactly one base pricing option');
    }

    return baseSelected[0];
  }

  private getBasePricing(pricing: BusinessServicePricing[], condition: PricingCondition): BusinessServicePricing {
    const base = pricing.find(p => p.condition === condition);
    if (!base) throw new Error(`Base pricing for ${condition} not found`);
    if (base.feeType !== FeeType.FIXED) {
      throw new Error(`Base pricing (${condition}) must be a fixed amount`);
    }
    return base;
  }

  private calculateFeeValue(base: number, pricing: BusinessServicePricing): number {
    switch (pricing.feeType) {
      case FeeType.PERCENTAGE:
        return base * (pricing.fee / 100);
      case FeeType.FIXED:
        return pricing.fee;
      default:
        throw new Error(`Invalid fee type: ${pricing.feeType}`);
    }
  }

  calculateServiceTotal({
    businessServicePricing,
    appliedPricingConditions
  }: ICalculateServiceTotal): IServiceTotalOrder {
    const selectedBase = this.validateBaseConditions(appliedPricingConditions);
    const basePricing = this.getBasePricing(businessServicePricing, selectedBase);

    let serviceFees = 0;
    let discounts = 0;
    let cancellationFee = 0;

    appliedPricingConditions
      .filter(c => !this.isBaseCondition(c))
      .forEach(condition => {
        const pricing = businessServicePricing.find(p => p.condition === condition);
        if (!pricing) return;

        const value = this.calculateFeeValue(basePricing.fee, pricing);

        if (this.isServiceFee(condition)) {
          serviceFees += value;
        } else if (this.isDiscount(condition)) {
          discounts += value;
        }
      });

    const subtotal = basePricing.fee + serviceFees;
    const preTaxTotal = Math.max(subtotal - discounts, 0) + cancellationFee;
    const taxes = this.calculateTaxes(preTaxTotal);

    return {
      basePrice: basePricing.fee,
      subscriptionType: selectedBase,
      serviceFees,
      discounts,
      subtotal,
      taxableAmount: preTaxTotal,
      taxes,
      totalAmount: preTaxTotal + taxes
    };
  }
}

export default ServicePriceCalculator;
