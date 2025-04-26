import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { getPreviousPeriodDates } from "../getPreviousPeriodDates";
import { aggregateDriverMetrics } from "./aggregateDriverMetrics";
import { collectReputationMetrics } from "./collectReputationMetrics";
import { fetchBusinessDrivers } from "./fetchBusinessDrivers";
import { fetchCompletedDeliveries } from "./fetchCompletedDeliveries";
import { fetchPreviousSummaries } from "./fetchPreviousSummaries";
import { generateDriverSummary } from "./generateDriverSummary";
import { DriverPerformanceSummaryMetrics } from "./initializeMetrics";

interface AggregatorInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  commissionPercentage: number;
  dbClient: any;
  logger: Logger;
}

export const aggregateDriverPerformance = async ({
  businessId,
  periodStart,
  periodEnd,
  timeGranularity,
  commissionPercentage,
  dbClient,
  logger
}: AggregatorInput): Promise<DriverPerformanceSummaryMetrics[]> => {
  const drivers = await fetchBusinessDrivers({ businessId, dbClient, logger });

  const { previousPeriodStart, previousPeriodEnd } = getPreviousPeriodDates({
    periodStart,
    periodEnd,
    timeGranularity
  });

  const summaries = await Promise.all(
    drivers.map(async (driver) => {
      const deliveries = await fetchCompletedDeliveries({
        driverId: driver.userId,
        businessId,
        periodStart,
        periodEnd,
        dbClient,
        logger
      });

      const driverMetrics = aggregateDriverMetrics({ deliveries, commissionPercentage });

      const ratingMetrics = await collectReputationMetrics({
        driverId: driver.userId,
        dbClient
      });

      const previousSummary = await fetchPreviousSummaries({
        driverId: driver.userId,
        businessId,
        timeGranularity,
        previousPeriodStart,
        previousPeriodEnd,
        dbClient,
        logger
      });

      return generateDriverSummary({
        driverId: driver.userId,
        businessId,
        driverMetrics,
        ratingMetrics,
        previousSummary,
        timeGranularity,
        periodStart,
        periodEnd
      });
    })
  );

  return summaries.filter(summary => summary !== null);
};
