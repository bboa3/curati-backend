import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { getPreviousPeriodDates } from "../getPreviousPeriodDates";
import { aggregateDriverMetrics } from "./aggregateDriverMetrics";
import { fetchCompletedDeliveries } from "./fetchCompletedDeliveries";
import { fetchDriverRatings } from "./fetchDriverRatings";
import { fetchPreviousSummaries } from "./fetchPreviousSummaries";
import { generatePerformanceSummaries } from "./generatePerformanceSummaries";

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
}: AggregatorInput) => {
  const deliveries = await fetchCompletedDeliveries({ businessId, periodStart, periodEnd, dbClient, logger });
  if (deliveries.length === 0) return [];

  const driverMetrics = aggregateDriverMetrics({ deliveries, commissionPercentage });
  const driverIds = Array.from(driverMetrics.keys());

  const ratingMetrics = await fetchDriverRatings({ driverIds, dbClient, logger });

  const { previousPeriodStart, previousPeriodEnd } = getPreviousPeriodDates({
    periodStart,
    periodEnd,
    timeGranularity
  });

  const previousSummaries = await fetchPreviousSummaries({
    businessId,
    timeGranularity,
    previousPeriodStart,
    previousPeriodEnd,
    dbClient,
    logger
  });

  return generatePerformanceSummaries({
    driverMetrics,
    ratingMetrics,
    previousSummaries,
    businessId,
    timeGranularity,
    periodStart,
    periodEnd
  });
};
