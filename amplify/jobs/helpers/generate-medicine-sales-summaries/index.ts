import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { v4 as generateUUIDv4 } from "uuid";
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { aggregateMedicineSales } from './aggregateMedicineSales';

interface GenerateSalesSummariesInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  dbClient: any;
  logger: Logger;
}

export const generateMedicineSalesSummaries = async ({ timeGranularity, dbClient, logger, businessId, periodStart, periodEnd }: GenerateSalesSummariesInput) => {
  const summaries = await aggregateMedicineSales({
    businessId: businessId,
    timeGranularity,
    periodStart,
    periodEnd,
    dbClient,
    logger,
  });

  if (summaries) {
    for (const summary of summaries) {
      const { errors: salesSummaryErrors } = await dbClient.models.medicineSalesSummary.create({
        id: generateUUIDv4(),
        businessId: businessId,
        pharmacyInventoryId: summary.pharmacyInventoryId,
        timeGranularity: timeGranularity,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        previousPeriodGrowth: summary.previousPeriodGrowth,
        totalRevenue: summary.totalRevenue,
        unitsSold: summary.unitsSold,
        ordersCount: summary.ordersCount,
        averageSellingPrice: summary.averageSellingPrice,
        unitsRefunded: summary.unitsRefunded,
      });

      if (salesSummaryErrors) {
        throw new Error(`Failed to create medicine sales summary: ${JSON.stringify(salesSummaryErrors)}`);
      }
    }
  }
};