import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { getPreviousPeriodDates } from "../getPreviousPeriodDates";
import { paginatedQuery } from "./paginatedQuery";

export const calculateWeightedAverage = (total: number, sum: number): number => {
  return total > 0 ? parseFloat((sum / total).toFixed(2)) : 0;
};

export const calculateGrowthMetrics = async (params: {
  dbClient: any;
  logger: Logger;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  currentRevenue: number;
}) => {
  const previousPeriod = getPreviousPeriodDates({
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    timeGranularity: params.timeGranularity
  });

  const previousSummaries = await paginatedQuery(
    params.dbClient.models.businessPerformanceSummary,
    {
      filter: {
        businessId: { eq: params.businessId },
        timeGranularity: { eq: params.timeGranularity },
        periodStart: { eq: previousPeriod.previousPeriodStart.toISOString() }
      }
    }
  );

  const previousRevenue = previousSummaries[0]?.totalRevenue || 0;
  return {
    revenueGrowth: calculateGrowthPercentage(params.currentRevenue, previousRevenue)
  };
};

const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
};