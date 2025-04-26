import { Dayjs } from "dayjs";
import { DriverPerformanceSummary, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { calculateAverage, calculateGrowthPercentage, calculatePercentage } from "./calculator";
import { DriverMetrics, DriverPerformanceSummaryMetrics, RatingMetrics } from "./initializeMetrics";

interface TriggerInput {
  driverMetrics: DriverMetrics;
  ratingMetrics: RatingMetrics;
  previousSummary: DriverPerformanceSummary;
  timeGranularity: SalesSummaryTimeGranularity;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  driverId: string,
  businessId: string
}

export const generateDriverSummary = ({ driverId, driverMetrics, ratingMetrics, previousSummary, businessId, timeGranularity, periodStart, periodEnd }: TriggerInput): DriverPerformanceSummaryMetrics => {
  return {
    businessId,
    driverId,
    timeGranularity,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    previousPeriodGrowth: calculateGrowthPercentage(
      driverMetrics.completedDeliveries,
      previousSummary?.completedDeliveries || 0
    ),
    completedDeliveries: driverMetrics.completedDeliveries,
    totalDeliveryFeesGenerated: parseFloat(driverMetrics.totalFees.toFixed(2)),
    totalCommissionEarned: parseFloat(driverMetrics.totalCommission.toFixed(2)),
    averageCommissionPerDelivery: calculateAverage(
      driverMetrics.totalCommission,
      driverMetrics.completedDeliveries
    ),
    averageDeliveryTimeMinutes: calculateAverage(
      driverMetrics.deliveryTimes.reduce((a, b) => a + b, 0),
      driverMetrics.deliveryTimes.length
    ),
    onTimeRatePercent: calculatePercentage(
      driverMetrics.onTimeCount,
      driverMetrics.completedDeliveries
    ),
    averageRating: ratingMetrics.averageRating,
    reviewsCount: ratingMetrics.reviewsCount,
    totalDistanceKm: parseFloat(driverMetrics.totalDistance.toFixed(2))
  };
};