import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";
import { getPreviousPeriodDates } from "../getPreviousPeriodDates";
import { aggregateSalesMetrics } from "./aggregateSalesMetrics";
import { fetchCompletedOrders } from "./fetchCompletedOrders";
import { fetchOrderItems } from "./fetchOrderItems";
import { fetchPharmacyInventories } from "./fetchPharmacyInventories";
import { fetchPreviousSummaries } from "./fetchPreviousSummaries";
import { generateSalesSummaries } from "./generateSalesSummaries";
import { MedicineSalesSummaryMetrics } from "./initializeMetrics";

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
}: AggregatorInput): Promise<MedicineSalesSummaryMetrics[]> => {
  const inventories = await fetchPharmacyInventories({ businessId, dbClient, logger });

  const orders = await fetchCompletedOrders({
    businessId,
    periodStart,
    periodEnd,
    dbClient,
    logger
  });

  const items = await fetchOrderItems({ orders });

  const salesAggregation = aggregateSalesMetrics({
    inventories,
    items,
    logger
  });


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
    inventories,
    aggregation: salesAggregation,
    previousSummaries,
    businessId,
    timeGranularity,
    periodStart,
    periodEnd
  });
};