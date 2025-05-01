import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity, ServicePerformanceSummary } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessServiceId: string;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  previousPeriodStart: Dayjs;
  previousPeriodEnd: Dayjs;
  dbClient: any;
}

export const fetchPreviousServiceSummaries = async ({
  businessServiceId,
  businessId,
  timeGranularity,
  previousPeriodStart,
  previousPeriodEnd,
  dbClient,
}: TriggerInput): Promise<ServicePerformanceSummary | null> => {
  const { data, errors } = await dbClient.models.servicePerformanceSummary.get({
    businessServiceId: { eq: businessServiceId },
    businessId: { eq: businessId },
    timeGranularity: { eq: timeGranularity },
    periodStart: { eq: previousPeriodStart.toISOString() },
    periodEnd: { eq: previousPeriodEnd.toISOString() }
  });

  if (errors) throw new Error(`Previous service summary fetch error: ${JSON.stringify(errors)}`);

  return data as ServicePerformanceSummary;
};