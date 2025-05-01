import { Dayjs } from "dayjs";
import { BusinessPerformanceSummary, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  previousPeriodStart: Dayjs;
  previousPeriodEnd: Dayjs;
  dbClient: any;
}

export const fetchPreviousSummaries = async ({ businessId, timeGranularity, previousPeriodStart, previousPeriodEnd, dbClient }: TriggerInput): Promise<BusinessPerformanceSummary | null> => {
  const { data, errors } = await dbClient.models.businessPerformanceSummary.get({
    businessId: { eq: businessId },
    timeGranularity: { eq: timeGranularity },
    periodStart: { eq: previousPeriodStart.toISOString() },
    periodEnd: { eq: previousPeriodEnd.toISOString() }
  });
  if (errors) throw new Error(`Previous summary fetch error: ${JSON.stringify(errors)}`);

  return data as BusinessPerformanceSummary;
};