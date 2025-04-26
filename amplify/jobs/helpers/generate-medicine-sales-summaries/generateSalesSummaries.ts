import { Dayjs } from "dayjs";
import { MedicineSalesSummary, PharmacyInventory, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { calculateAveragePrice, calculateGrowthPercentage } from "./calculator";
import { initializeMetrics, MedicineSalesSummaryMetrics, SalesMetrics } from "./initializeMetrics";

interface TriggerInput {
  inventories: PharmacyInventory[];
  aggregation: Map<string, SalesMetrics>;
  previousSummaries: Map<string, MedicineSalesSummary>
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}

export const generateSalesSummaries = ({
  inventories,
  aggregation,
  previousSummaries,
  businessId,
  timeGranularity,
  periodStart,
  periodEnd
}: TriggerInput): MedicineSalesSummaryMetrics[] => {
  return inventories.map(inventory => {
    const metrics = aggregation.get(inventory.id) || initializeMetrics();

    const previous = previousSummaries.get(inventory.id);

    return {
      businessId,
      pharmacyInventoryId: inventory.id,
      timeGranularity,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      totalRevenue: metrics.totalRevenue,
      unitsSold: metrics.unitsSold,
      ordersCount: metrics.ordersCount.size,
      unitsRefunded: metrics.unitsRefunded,
      previousPeriodGrowth: calculateGrowthPercentage(
        metrics.totalRevenue,
        previous?.totalRevenue || 0
      ),
      averageSellingPrice: calculateAveragePrice(metrics.totalRevenue, metrics.unitsSold),
    };
  });
};