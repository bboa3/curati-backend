import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity, ServicePerformanceSummary } from "../../../functions/helpers/types/schema";
import { calculateGrowthPercentage } from "../generate-driver-performance-summaries/calculator";
import { ServiceMetrics, ServiceSummaryData } from "./initializeMetrics";

interface TriggerInput {
  serviceMetrics: Map<string, ServiceMetrics>;
  previousSummaries: Map<string, ServicePerformanceSummary>;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}

export const generateServiceSummaries = ({
  serviceMetrics,
  previousSummaries,
  businessId,
  timeGranularity,
  periodStart,
  periodEnd
}: TriggerInput): ServiceSummaryData[] => {
  return Array.from(serviceMetrics.entries()).map(([businessServiceId, metrics]) => {
    const previous = previousSummaries.get(businessServiceId);

    return {
      businessId,
      businessServiceId,
      timeGranularity,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      previousPeriodGrowth: calculateGrowthPercentage(
        metrics.totalRevenue,
        previous?.totalRevenue || 0
      ),
      totalRevenue: parseFloat(metrics.totalRevenue.toFixed(2)),
      contractsSold: metrics.contractsSold,
      appointmentsCompleted: metrics.appointmentsCompleted,
      averageSessionDuration: metrics.averageSessionDuration,
      averageRevenuePerContract: parseFloat(metrics.averageRevenuePerContract.toFixed(2)),
      averageRevenuePerAppointment: parseFloat(metrics.averageRevenuePerAppointment.toFixed(2)),
      cancellationRate: metrics.cancellationRate,
      rescheduledAppointments: metrics.rescheduledAppointments,
      totalContractsValue: parseFloat(metrics.totalContractsValue.toFixed(2))
    };
  });
};