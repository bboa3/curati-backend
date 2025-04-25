export type SalesMetrics = {
  totalRevenue: number;
  totalUnits: number;
  orderIds: Set<string>;
};

export const initializeMetrics = (): SalesMetrics => ({
  totalRevenue: 0,
  totalUnits: 0,
  orderIds: new Set<string>(),
});