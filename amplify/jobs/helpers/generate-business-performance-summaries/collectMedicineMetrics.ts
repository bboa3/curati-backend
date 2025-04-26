import { Dayjs } from "dayjs";
import { MedicineSalesSummary } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "../paginatedQuery";

export const collectMedicineMetrics = async (params: {
  dbClient: any;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}) => {
  const summaries: MedicineSalesSummary[] = await paginatedQuery(
    params.dbClient.models.medicineSalesSummary,
    {
      filter: {
        businessId: { eq: params.businessId },
        periodStart: { eq: params.periodStart.toISOString() },
        periodEnd: { eq: params.periodEnd.toISOString() }
      }
    }
  );

  return summaries.reduce((acc: any, summary: any) => ({
    revenue: acc.revenue + (summary.totalRevenue || 0),
    unitsSold: acc.unitsSold + (summary.unitsSold || 0),
    ordersCount: acc.ordersCount + (summary.ordersCount || 0),
    unitsRefunded: acc.unitsRefunded + (summary.unitsRefunded || 0)
  }), { revenue: 0, unitsSold: 0, ordersCount: 0, unitsRefunded: 0 });
};
