import { MedicineSalesSummary } from "../../../functions/helpers/types/schema";

export type SalesMetrics = {
  unitsSold: number;
  unitsRefunded: number;
  totalRevenue: number;
  ordersCount: Set<string>;
};

export type MedicineSalesSummaryMetrics = Omit<MedicineSalesSummary, 'id' | 'createdAt' | 'updatedAt'>;

export const initializeMetrics = (): SalesMetrics => ({
  unitsSold: 0,
  unitsRefunded: 0,
  totalRevenue: 0,
  ordersCount: new Set()
});