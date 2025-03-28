export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export interface Discount {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
}

const discounts: Discount[] = [
  {
    code: "FIRST10",
    description: "10% off on your first purchase",
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on your first purchase",
    discountType: DiscountType.FIXED,
    discountValue: 100,
  },
];

export const getDiscountByCode = (code: string): Discount | undefined => {
  return discounts.find(discount => discount.code === code);
}