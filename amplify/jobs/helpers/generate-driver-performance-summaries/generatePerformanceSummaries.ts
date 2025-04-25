import { Dayjs } from "dayjs";
import { DriverPerformanceSummary, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { calculateAverage, calculateGrowthPercentage, calculatePercentage } from "./calculator";
import { DriverMetrics, RatingMetrics } from "./initializeMetrics";

interface TriggerInput {
  driverMetrics: Map<string, DriverMetrics>;
  ratingMetrics: Map<string, RatingMetrics>;
  previousSummaries: Map<string, DriverPerformanceSummary>;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}

export const generatePerformanceSummaries = ({ driverMetrics, ratingMetrics, previousSummaries, businessId, timeGranularity, periodStart, periodEnd }: TriggerInput) => {
  return Array.from(driverMetrics.entries()).map(([driverId, metrics]) => {
    const previous = previousSummaries.get(driverId);
    const ratings = ratingMetrics.get(driverId) || { ratingSum: 0, ratingCount: 0 };

    return {
      businessId,
      driverId,
      timeGranularity,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      previousPeriodGrowth: calculateGrowthPercentage(
        metrics.completedDeliveries,
        previous?.completedDeliveries || 0
      ),
      completedDeliveries: metrics.completedDeliveries,
      totalDeliveryFeesGenerated: parseFloat(metrics.totalFees.toFixed(2)),
      totalCommissionEarned: parseFloat(metrics.totalCommission.toFixed(2)),
      averageCommissionPerDelivery: calculateAverage(
        metrics.totalCommission,
        metrics.completedDeliveries
      ),
      averageDeliveryTimeMinutes: calculateAverage(
        metrics.deliveryTimes.reduce((a, b) => a + b, 0),
        metrics.deliveryTimes.length
      ),
      onTimeRatePercent: calculatePercentage(
        metrics.onTimeCount,
        metrics.completedDeliveries
      ),
      averageRating: calculateAverage(ratings.ratingSum, ratings.ratingCount),
      reviewsCount: ratings.ratingCount,
      totalDistanceKm: parseFloat(metrics.totalDistance.toFixed(2))
    };
  });
};