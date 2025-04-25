import { ServicePerformanceSummary } from "../../../functions/helpers/types/schema";

export type ServiceMetrics = {
  businessServiceId: string;
  totalRevenue: number;
  contractsSold: number;
  appointmentsCompleted: number;
  averageSessionDuration: number;
  cancellationRate: number;
  rescheduledAppointments: number;
  totalContractsValue: number;
  averageRevenuePerContract: number;
  averageRevenuePerAppointment: number;
};

export type ServiceSummaryData = Omit<ServicePerformanceSummary, 'id' | 'createdAt' | 'updatedAt'>;

export const initializeServiceMetrics = (serviceId: string): ServiceMetrics => ({
  businessServiceId: serviceId,
  totalRevenue: 0,
  contractsSold: 0,
  appointmentsCompleted: 0,
  averageSessionDuration: 0,
  cancellationRate: 0,
  rescheduledAppointments: 0,
  totalContractsValue: 0,
  averageRevenuePerContract: 0,
  averageRevenuePerAppointment: 0
});