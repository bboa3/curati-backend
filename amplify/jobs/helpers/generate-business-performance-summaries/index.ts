import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { v4 as generateUUIDv4 } from 'uuid';
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { businessMetricsAggregator } from './businessMetricsAggregator';

interface GenerateBusinessSummaryInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  dbClient: any;
  logger: Logger;
}

export const generateBusinessPerformanceSummaries = async ({
  timeGranularity,
  dbClient,
  logger,
  businessId,
  periodStart,
  periodEnd
}: GenerateBusinessSummaryInput) => {
  const summary = await businessMetricsAggregator({
    businessId,
    periodStart,
    periodEnd,
    timeGranularity,
    dbClient,
    logger
  });

  logger.info(`Creating business performance summary for ${businessId}`, summary);

  const { errors } = await dbClient.models.businessPerformanceSummary.create({
    id: generateUUIDv4(),
    businessId,
    timeGranularity,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    totalRevenue: summary.totalRevenue,
    medicineRevenue: summary.medicineRevenue,
    serviceRevenue: summary.serviceRevenue,
    deliveryRevenue: summary.deliveryRevenue,
    previousPeriodRevenueGrowthPercent: summary.previousPeriodRevenueGrowthPercent,
    totalMedicineUnitsSold: summary.totalMedicineUnitsSold,
    totalMedicineOrdersCount: summary.totalMedicineOrdersCount,
    totalMedicineUnitsRefunded: summary.totalMedicineUnitsRefunded,
    totalAppointmentsCompleted: summary.totalAppointmentsCompleted,
    totalContractsSold: summary.totalContractsSold,
    totalContractsValue: summary.totalContractsValue,
    averageServiceCancellationRate: summary.averageServiceCancellationRate,
    totalAppointmentsRescheduled: summary.totalAppointmentsRescheduled,
    totalDeliveriesCompleted: summary.totalDeliveriesCompleted,
    averageBusinessRating: summary.averageBusinessRating,
    totalBusinessRatings: summary.totalBusinessRatings
  });

  if (errors) {
    throw new Error(`Failed to create business performance summary: ${JSON.stringify(errors)}`);
  }

  logger.info(`Created business performance summary for ${businessId}`);
};