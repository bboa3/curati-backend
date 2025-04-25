import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity, ServicePerformanceSummary } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  previousPeriodStart: Dayjs;
  previousPeriodEnd: Dayjs;
  dbClient: any;
  logger: Logger
}

export const fetchPreviousServiceSummaries = async ({
  businessId,
  timeGranularity,
  previousPeriodStart,
  previousPeriodEnd,
  dbClient,
  logger
}: TriggerInput): Promise<Map<string, ServicePerformanceSummary>> => {
  const summariesMap = new Map<string, ServicePerformanceSummary>();
  let nextToken: string | null = null;

  do {
    const { data: chunk, errors, nextToken: newNextToken } = await dbClient.models.servicePerformanceSummary.list({
      filter: {
        businessId: { eq: businessId },
        timeGranularity: { eq: timeGranularity },
        periodStart: { eq: previousPeriodStart.toISOString() },
        periodEnd: { eq: previousPeriodEnd.toISOString() }
      },
      limit: 1000,
      nextToken,
    }) as any;

    if (errors) throw new Error(`Previous service summary fetch error: ${JSON.stringify(errors)}`);
    chunk.forEach((summary: ServicePerformanceSummary) =>
      summariesMap.set(summary.businessServiceId, summary));
    nextToken = newNextToken;
  } while (nextToken);

  logger.info(`Found ${summariesMap.size} previous service summaries`);
  return summariesMap;
};