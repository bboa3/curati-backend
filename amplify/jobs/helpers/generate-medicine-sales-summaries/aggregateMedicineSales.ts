import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { getPreviousPeriodDates } from "../getPreviousPeriodDates";
import { aggregateSalesMetrics } from "./aggregateSalesMetrics";
import { fetchCompletedOrders } from "./fetchCompletedOrders";
import { fetchOrderItems } from "./fetchOrderItems";
import { fetchPreviousSummaries } from "./fetchPreviousSummaries";
import { generateSalesSummaries } from "./generateSalesSummaries";

interface AggregatorInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  dbClient: any;
  logger: Logger;
}

export const aggregateMedicineSales = async ({
  businessId,
  periodStart,
  periodEnd,
  timeGranularity,
  dbClient,
  logger
}: AggregatorInput) => {
  const orders = await fetchCompletedOrders({ businessId, periodStart, periodEnd, dbClient, logger });
  if (orders.length === 0) return [];

  const items = await fetchOrderItems({ orders });
  const salesAggregation = aggregateSalesMetrics(items);
  if (salesAggregation.size === 0) return [];

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

  return generateSalesSummaries({
    aggregation: salesAggregation,
    previousSummaries,
    businessId,
    timeGranularity,
    periodStart,
    periodEnd
  });
};