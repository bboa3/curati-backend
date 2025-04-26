import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity, ServicePerformanceSummary } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessServiceId: string;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  previousPeriodStart: Dayjs;
  previousPeriodEnd: Dayjs;
  dbClient: any;
  logger: Logger
}

export const fetchPreviousServiceSummaries = async ({
  businessServiceId,
  businessId,
  timeGranularity,
  previousPeriodStart,
  previousPeriodEnd,
  dbClient,
  logger
}: TriggerInput): Promise<ServicePerformanceSummary> => {
  const { data, errors } = await dbClient.models.servicePerformanceSummary.list({
    filter: {
      businessServiceId: { eq: businessServiceId },
      businessId: { eq: businessId },
      timeGranularity: { eq: timeGranularity },
      periodStart: { eq: previousPeriodStart.toISOString() },
      periodEnd: { eq: previousPeriodEnd.toISOString() }
    },
  });

  if (errors) throw new Error(`Previous service summary fetch error: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} previous summaries for comparison`);

  return data[0] as ServicePerformanceSummary;
};