import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity, ServicePerformanceSummary } from "../../../functions/helpers/types/schema";
import { calculateGrowthPercentage } from "../generate-driver-performance-summaries/calculator";
import { ServiceMetrics, ServicePerformanceSummaryMetrics } from "./initializeMetrics";

interface TriggerInput {
  serviceMetrics: ServiceMetrics;
  previousSummary: ServicePerformanceSummary;
  businessServiceId: string;
  businessId: string;
  timeGranularity: SalesSummaryTimeGranularity;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}

export const generateServiceSummaries = ({
  serviceMetrics,
  previousSummary,
  businessId,
  businessServiceId,
  timeGranularity,
  periodStart,
  periodEnd
}: TriggerInput): ServicePerformanceSummaryMetrics => {

  return {
    businessId,
    businessServiceId,
    timeGranularity,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    previousPeriodGrowth: calculateGrowthPercentage(
      serviceMetrics.totalRevenue,
      previousSummary?.totalRevenue || 0
    ),
    totalRevenue: parseFloat(serviceMetrics.totalRevenue.toFixed(2)),
    contractsSold: serviceMetrics.contractsSold,
    appointmentsCompleted: serviceMetrics.appointmentsCompleted,
    averageSessionDuration: serviceMetrics.averageSessionDuration,
    averageRevenuePerContract: parseFloat(serviceMetrics.averageRevenuePerContract.toFixed(2)),
    averageRevenuePerAppointment: parseFloat(serviceMetrics.averageRevenuePerAppointment.toFixed(2)),
    cancellationRate: serviceMetrics.cancellationRate,
    rescheduledAppointments: serviceMetrics.rescheduledAppointments,
    totalContractsValue: parseFloat(serviceMetrics.totalContractsValue.toFixed(2))
  };
};