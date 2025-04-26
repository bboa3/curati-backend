import { Dayjs } from "dayjs";
import { DriverPerformanceSummary } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "../paginatedQuery";

export const collectDeliveryRevenue = async (params: {
  dbClient: any;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}) => {
  const summaries: DriverPerformanceSummary[] = await paginatedQuery(
    params.dbClient.models.driverPerformanceSummary,
    {
      filter: {
        businessId: { eq: params.businessId },
        periodStart: { eq: params.periodStart.toISOString() },
        periodEnd: { eq: params.periodEnd.toISOString() }
      }
    }
  );

  return {
    revenue: summaries.reduce((sum: number, s: any) => sum + (s.totalDeliveryFeesGenerated || 0), 0)
  };
};
