import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { DriverPerformanceSummary, SalesSummaryTimeGranularity } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  driverId: string;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  previousPeriodStart: Dayjs;
  previousPeriodEnd: Dayjs;
  dbClient: any;
  logger: Logger
}

export const fetchPreviousSummaries = async ({ driverId, businessId, timeGranularity, previousPeriodStart, previousPeriodEnd, dbClient, logger }: TriggerInput): Promise<DriverPerformanceSummary> => {
  const { data, errors } = await dbClient.models.driverPerformanceSummary.list({
    filter: {
      driverId: { eq: driverId },
      businessId: { eq: businessId },
      timeGranularity: { eq: timeGranularity },
      periodStart: { eq: previousPeriodStart.toISOString() },
      periodEnd: { eq: previousPeriodEnd.toISOString() }
    },
  });
  if (errors) throw new Error(`Previous summary fetch error: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} previous summaries for comparison`);

  return data[0] as DriverPerformanceSummary;
};