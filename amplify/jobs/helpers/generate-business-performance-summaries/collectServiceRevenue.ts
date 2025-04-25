import { Dayjs } from "dayjs";
import { ServicePerformanceSummary } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "./paginatedQuery";

export const collectServiceRevenue = async (params: {
  dbClient: any;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}) => {
  const summaries: ServicePerformanceSummary[] = await paginatedQuery(
    params.dbClient.models.servicePerformanceSummary,
    {
      filter: {
        businessId: { eq: params.businessId },
        periodStart: { eq: params.periodStart.toISOString() },
        periodEnd: { eq: params.periodEnd.toISOString() }
      }
    }
  );

  return {
    revenue: summaries.reduce((sum: number, s: any) => sum + (s.totalRevenue || 0), 0)
  };
};
