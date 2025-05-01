import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { getPreviousPeriodDates } from "../getPreviousPeriodDates";
import { fetchPreviousSummaries } from "./fetchPreviousSummaries";

export const calculateWeightedAverage = (total: number, sum: number): number => {
  return total > 0 ? parseFloat((sum / total).toFixed(2)) : 0;
};

export const calculateWeightedMetric = (
  existingCount: number,
  existingValue: number,
  newCount: number,
  newValue: number
): number => {
  const total = existingCount + newCount;
  return total > 0
    ? parseFloat(((existingCount * existingValue + newCount * newValue) / total).toFixed(2))
    : 0;
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
  const { previousPeriodEnd, previousPeriodStart } = getPreviousPeriodDates({
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    timeGranularity: params.timeGranularity
  });

  const previousSummaries = await fetchPreviousSummaries({
    dbClient: params.dbClient,
    businessId: params.businessId,
    timeGranularity: params.timeGranularity,
    previousPeriodStart,
    previousPeriodEnd,
  })

  const previousRevenue = previousSummaries?.totalRevenue || 0;
  return {
    revenueGrowth: calculateGrowthPercentage(params.currentRevenue, previousRevenue)
  };
};

export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
};