import { Discount, DiscountType } from "./getDiscountByCode";

interface IItemDetail {
  quantity: number;
  unit_price: number;
}

interface ICalculateTotal {
  items: IItemDetail[];
  discounts: Discount[];
}

interface ITotalOrder {
  subTotal: number;
  discount: number;
  taxes: number;
  totalAmount: number;
}

class PriceCalculator {
  taxPercentage: number;

  constructor() {
    this.taxPercentage = 0.0;
  }

  calculateItemTotal({ quantity, unit_price }: IItemDetail): number {
    return quantity * unit_price;
  }

  calculateItemDiscount(total_price: number, discounts: Discount[]): number {
    let totalDiscount = 0;
    for (const discount of discounts) {
      if (discount.discountType === DiscountType.PERCENTAGE) {
        totalDiscount += (total_price * discount.discountValue) / 100;
      } else {
        totalDiscount += discount.discountValue;
      }
    }
    return totalDiscount;
  }

  calculateItemTax(total_price: number): number {
    return (total_price * this.taxPercentage) / 100;
  }

  calculateTotalOrder({ items, discounts }: ICalculateTotal): ITotalOrder {
    let subTotal = 0;
    let discount = 0;

    for (const item of items) {
      const itemTotal = this.calculateItemTotal(item);
      const itemDiscount = this.calculateItemDiscount(itemTotal, discounts);

      subTotal += (itemTotal - itemDiscount);
      discount += itemDiscount;
    }

    const taxes = this.calculateItemTax(subTotal);
    const totalAmount = subTotal + taxes;

    return {
      subTotal,
      discount,
      taxes,
      totalAmount,
    }
  }
}

export default PriceCalculator;
