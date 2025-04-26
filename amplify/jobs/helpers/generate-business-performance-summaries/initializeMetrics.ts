import { BusinessPerformanceSummary } from "../../../functions/helpers/types/schema";

export type BusinessMetrics = {
  totalRevenue: number;
  medicineRevenue: number;
  serviceRevenue: number;
  deliveryRevenue: number;
  totalMedicineUnitsSold: number;
  totalMedicineOrdersCount: number;
  totalMedicineUnitsRefunded: number;
  totalAppointmentsCompleted: number;
  totalContractsSold: number;
  totalContractsValue: number;
  averageServiceCancellationRate: number;
  totalAppointmentsRescheduled: number;
  totalDeliveriesCompleted: number;
  averageDeliveryTimeMinutes: number;
  onTimeRatePercent: number;
  averageRating: number;
  reviewsCount: number;
  previousPeriodGrowth: number;
};

export type BusinessPerformanceMetrics = Omit<BusinessPerformanceSummary, 'id' | 'createdAt' | 'updatedAt'>;
