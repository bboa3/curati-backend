import { Dayjs } from "dayjs";
import { ServicePerformanceSummary } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "../paginatedQuery";

export const collectServiceMetrics = async (params: {
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

  return summaries.reduce((acc: any, summary: any) => ({
    totalAppointmentsCompleted: acc.totalAppointmentsCompleted + (summary.appointmentsCompleted || 0),
    totalContractsSold: acc.totalContractsSold + (summary.contractsSold || 0),
    totalContractsValue: acc.totalContractsValue + (summary.totalContractsValue || 0),
    cancellationRateSum: acc.cancellationRateSum +
      (summary.cancellationRate || 0) * (summary.appointmentsCompleted || 0),
    totalAppointmentsRescheduled: acc.totalAppointmentsRescheduled +
      (summary.rescheduledAppointments || 0)
  }), {
    totalAppointmentsCompleted: 0,
    totalContractsSold: 0,
    totalContractsValue: 0,
    cancellationRateSum: 0,
    totalAppointmentsRescheduled: 0
  });
};