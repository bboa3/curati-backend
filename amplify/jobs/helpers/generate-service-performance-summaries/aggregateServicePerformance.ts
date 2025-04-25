import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { getPreviousPeriodDates } from '../getPreviousPeriodDates';
import { calculateServiceMetrics } from './calculateServiceMetrics';
import { fetchBusinessServicePricing } from './fetchBusinessServicePricing';
import { fetchCompletedAppointments } from './fetchCompletedAppointments';
import { fetchContractPayments } from './fetchContractPayments';
import { fetchPreviousServiceSummaries } from './fetchPreviousServiceSummaries';
import { fetchServiceContracts } from './fetchServiceContracts';
import { generateServiceSummaries } from './generateServiceSummaries';
import { ServiceSummaryData } from './initializeMetrics';

interface AggregatorInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
  dbClient: any;
  logger: Logger;
}

export const aggregateServicePerformance = async ({
  businessId,
  periodStart,
  periodEnd,
  timeGranularity,
  dbClient,
  logger
}: AggregatorInput): Promise<ServiceSummaryData[]> => {
  const contracts = await fetchServiceContracts({ businessId, periodStart, periodEnd, dbClient, logger });
  if (contracts.length === 0) return [];

  const businessServiceIds = [...new Set(contracts.map(c => c.businessServiceId))];
  const businessServicePricing = await fetchBusinessServicePricing({
    businessServiceIds,
    dbClient,
    logger
  });

  const appointments = await fetchCompletedAppointments({ businessId, periodStart, periodEnd, dbClient, logger });

  const payments = await fetchContractPayments({ contracts, periodStart, periodEnd, dbClient, logger });

  const serviceMetrics = calculateServiceMetrics({ contracts, appointments, payments, businessServicePricing });

  const { previousPeriodStart, previousPeriodEnd } = getPreviousPeriodDates({
    periodStart,
    periodEnd,
    timeGranularity
  });

  const previousSummaries = await fetchPreviousServiceSummaries({
    businessId,
    timeGranularity,
    previousPeriodStart,
    previousPeriodEnd,
    dbClient,
    logger
  });

  return generateServiceSummaries({
    serviceMetrics,
    previousSummaries,
    businessId,
    timeGranularity,
    periodStart,
    periodEnd
  });
};