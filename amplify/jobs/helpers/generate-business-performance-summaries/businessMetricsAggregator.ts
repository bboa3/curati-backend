import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { calculateGrowthMetrics, calculateWeightedAverage } from './calculator';
import { collectDeliveryMetrics } from './collectDeliveryMetrics';
import { collectFinancialMetrics } from './collectFinancialMetrics';
import { collectReputationMetrics } from './collectReputationMetrics';
import { collectServiceMetrics } from './collectServiceMetrics';
import { BusinessPerformanceMetrics } from './initializeMetrics';

export const businessMetricsAggregator = async (params: {
  dbClient: any;
  logger: Logger;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
}): Promise<BusinessPerformanceMetrics> => {
  const [financials, services, deliveries, reputation] = await Promise.all([
    collectFinancialMetrics(params),
    collectServiceMetrics(params),
    collectDeliveryMetrics(params),
    collectReputationMetrics(params),
  ]);

  const growth = await calculateGrowthMetrics({
    ...params,
    currentRevenue: financials.totalRevenue
  });

  return {
    businessId: params.businessId,
    periodStart: params.periodStart.toISOString(),
    periodEnd: params.periodEnd.toISOString(),
    timeGranularity: params.timeGranularity,
    ...financials,
    ...services,
    ...deliveries,
    ...reputation,
    previousPeriodGrowth: growth.revenueGrowth,
    averageServiceCancellationRate: calculateWeightedAverage(
      services.totalAppointmentsCompleted,
      services.cancellationRateSum
    )
  };
};
