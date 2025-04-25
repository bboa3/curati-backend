import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { MedicineSalesSummary, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  previousPeriodStart: Dayjs;
  previousPeriodEnd: Dayjs;
  dbClient: any;
  logger: Logger;
}

export const fetchPreviousSummaries = async ({ businessId, timeGranularity, previousPeriodStart, previousPeriodEnd, dbClient, logger }: TriggerInput): Promise<Map<string, MedicineSalesSummary>> => {
  const summariesMap = new Map<string, MedicineSalesSummary>();
  let nextToken: string | null = null;

  do {
    const { data: chunk, errors, nextToken: newNextToken } = await dbClient.models.medicineSalesSummary.list({
      filter: {
        businessId: { eq: businessId },
        timeGranularity: { eq: timeGranularity },
        periodStart: { eq: previousPeriodStart.toISOString() },
        periodEnd: { eq: previousPeriodEnd.toISOString() },
      },
      limit: 1000,
      nextToken,
    }) as any

    if (errors) throw new Error(`Previous summary fetch error: ${JSON.stringify(errors)}`);

    chunk.forEach((summary: MedicineSalesSummary) => summariesMap.set(summary.pharmacyInventoryId, summary));
    nextToken = newNextToken;
  } while (nextToken);

  logger.info(`Found ${summariesMap.size} previous summaries for comparison`);
  return summariesMap;
};