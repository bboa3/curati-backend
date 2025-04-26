import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { getPreviousPeriodDates } from '../getPreviousPeriodDates';
import { calculateServiceMetrics } from './calculateServiceMetrics';
import { fetchBusinessServicePricing } from './fetchBusinessServicePricing';
import { fetchBusinessServices } from './fetchBusinessServices';
import { fetchCompletedAppointments } from './fetchCompletedAppointments';
import { fetchContractPayments } from './fetchContractPayments';
import { fetchPreviousServiceSummaries } from './fetchPreviousServiceSummaries';
import { fetchServiceContracts } from './fetchServiceContracts';
import { generateServiceSummaries } from './generateServiceSummaries';
import { ServicePerformanceSummaryMetrics } from './initializeMetrics';

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
}: AggregatorInput): Promise<ServicePerformanceSummaryMetrics[]> => {
  const services = await fetchBusinessServices({ businessId, dbClient, logger });

  const { previousPeriodStart, previousPeriodEnd } = getPreviousPeriodDates({
    periodStart,
    periodEnd,
    timeGranularity
  });

  const summaries = await Promise.all(
    services.map(async (service) => {
      const contracts = await fetchServiceContracts({
        businessId,
        businessServiceId: service.id,
        periodStart,
        periodEnd,
        dbClient,
        logger
      });

      const businessServicePricing = await fetchBusinessServicePricing({
        businessServiceId: service.id,
        dbClient,
        logger
      });

      const appointments = await fetchCompletedAppointments({
        businessId,
        businessServiceId: service.id,
        periodStart,
        periodEnd,
        dbClient,
        logger
      });

      const payments = await fetchContractPayments({ contracts, periodStart, periodEnd, dbClient, logger });

      const serviceMetrics = calculateServiceMetrics({
        businessServiceId: service.id,
        contracts,
        appointments,
        payments,
        businessServicePricing
      });

      const previousSummary = await fetchPreviousServiceSummaries({
        businessId,
        businessServiceId: service.id,
        timeGranularity,
        previousPeriodStart,
        previousPeriodEnd,
        dbClient,
        logger
      });

      return generateServiceSummaries({
        serviceMetrics,
        previousSummary,
        businessId,
        businessServiceId: service.id,
        timeGranularity,
        periodStart,
        periodEnd
      });
    })
  );

  return summaries.filter(summary => summary !== null);
};