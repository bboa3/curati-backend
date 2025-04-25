import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { v4 as generateUUIDv4 } from 'uuid';
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { aggregateServicePerformance } from './aggregateServicePerformance';

interface GenerateServiceSummariesInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  dbClient: any;
  logger: Logger;
}

export const generateServicePerformanceSummaries = async ({
  timeGranularity,
  dbClient,
  logger,
  businessId,
  periodStart,
  periodEnd
}: GenerateServiceSummariesInput) => {
  const summaries = await aggregateServicePerformance({
    businessId,
    timeGranularity,
    periodStart,
    periodEnd,
    dbClient,
    logger,
  });

  if (summaries) {
    for (const summary of summaries) {
      const { errors } = await dbClient.models.servicePerformanceSummary.create({
        id: generateUUIDv4(),
        businessId,
        businessServiceId: summary.businessServiceId,
        timeGranularity,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        previousPeriodGrowth: summary.previousPeriodGrowth,
        totalRevenue: summary.totalRevenue,
        contractsSold: summary.contractsSold,
        appointmentsCompleted: summary.appointmentsCompleted,
        averageSessionDuration: summary.averageSessionDuration,
        averageRevenuePerContract: summary.averageRevenuePerContract,
        averageRevenuePerAppointment: summary.averageRevenuePerAppointment,
        cancellationRate: summary.cancellationRate,
        rescheduledAppointments: summary.rescheduledAppointments,
        totalContractsValue: summary.totalContractsValue
      });

      if (errors) {
        throw new Error(`Failed to create service performance summary: ${JSON.stringify(errors)}`);
      }
    }
  }
};