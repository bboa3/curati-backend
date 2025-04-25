import { Dayjs } from "dayjs";
import { DriverPerformanceSummary } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "./paginatedQuery";

export const collectDeliveryMetrics = async (params: {
  dbClient: any;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}) => {
  const summaries: DriverPerformanceSummary[] = await paginatedQuery(
    params.dbClient.models.driverPerformanceSummary,
    {
      filter: {
        businessId: { eq: params.businessId },
        periodStart: { eq: params.periodStart.toISOString() },
        periodEnd: { eq: params.periodEnd.toISOString() }
      }
    }
  );

  return summaries.reduce((acc: any, summary: any) => ({
    totalDeliveriesCompleted: acc.totalDeliveriesCompleted + (summary.completedDeliveries || 0),
    averageDeliveryTimeMinutes: calculateWeightedMetric(
      acc.totalDeliveriesCompleted,
      acc.averageDeliveryTimeMinutes,
      summary.completedDeliveries || 0,
      summary.averageDeliveryTimeMinutes || 0
    ),
    onTimeRatePercent: calculateWeightedMetric(
      acc.totalDeliveriesCompleted,
      acc.onTimeRatePercent,
      summary.completedDeliveries || 0,
      summary.onTimeRatePercent || 0
    )
  }), {
    totalDeliveriesCompleted: 0,
    averageDeliveryTimeMinutes: 0,
    onTimeRatePercent: 0
  });
};