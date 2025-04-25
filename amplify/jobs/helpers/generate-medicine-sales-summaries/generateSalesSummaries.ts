import { Dayjs } from "dayjs";
import { MedicineSalesSummary, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { calculateAveragePrice, calculateGrowthPercentage } from "./calculator";
import { SalesMetrics } from "./initializeMetrics";

interface TriggerInput {
  aggregation: Map<string, SalesMetrics>;
  previousSummaries: Map<string, MedicineSalesSummary>;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}

export const generateSalesSummaries = ({ aggregation, previousSummaries, businessId, timeGranularity, periodStart, periodEnd }: TriggerInput) => {
  return Array.from(aggregation.entries()).map(([pharmacyInventoryId, metrics]) => {
    const previousRevenue = previousSummaries.get(pharmacyInventoryId)?.totalRevenue || 0;
    const growth = calculateGrowthPercentage(metrics.totalRevenue, previousRevenue);

    return {
      businessId,
      pharmacyInventoryId,
      timeGranularity,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      previousPeriodGrowth: growth,
      totalRevenue: parseFloat(metrics.totalRevenue.toFixed(2)),
      unitsSold: metrics.totalUnits,
      ordersCount: metrics.orderIds.size,
      averageSellingPrice: calculateAveragePrice(metrics.totalRevenue, metrics.totalUnits),
      unitsRefunded: 0
    };
  });
};