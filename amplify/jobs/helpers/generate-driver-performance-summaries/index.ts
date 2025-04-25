import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { v4 as generateUUIDv4 } from "uuid";
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { aggregateDriverPerformance } from './aggregateDriverPerformance';

interface GenerateSalesSummariesInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  commissionPercentage: number;
  dbClient: any;
  logger: Logger;
}

export const generateDriverPerformanceSummaries = async ({ timeGranularity, commissionPercentage, dbClient, logger, businessId, periodStart, periodEnd }: GenerateSalesSummariesInput) => {
  const summaries = await aggregateDriverPerformance({
    businessId: businessId,
    timeGranularity,
    commissionPercentage,
    periodStart,
    periodEnd,
    dbClient,
    logger,
  });

  if (summaries) {
    for (const summary of summaries) {
      const { errors: salesSummaryErrors } = await dbClient.models.driverPerformanceSummary.create({
        id: generateUUIDv4(),
        businessId: businessId,
        driverId: summary.driverId,
        timeGranularity: timeGranularity,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        previousPeriodGrowth: summary.previousPeriodGrowth,
        completedDeliveries: summary.completedDeliveries,
        totalDeliveryFeesGenerated: summary.totalDeliveryFeesGenerated,
        totalCommissionEarned: summary.totalCommissionEarned,
        averageCommissionPerDelivery: summary.averageCommissionPerDelivery,
        averageDeliveryTimeMinutes: summary.averageDeliveryTimeMinutes,
        onTimeRatePercent: summary.onTimeRatePercent,
        averageRating: summary.averageRating,
        reviewsCount: summary.reviewsCount,
        totalDistanceKm: summary.totalDistanceKm,
      });

      if (salesSummaryErrors) {
        throw new Error(`Failed to create medicine sales summary: ${JSON.stringify(salesSummaryErrors)}`);
      }
    }
  }
};