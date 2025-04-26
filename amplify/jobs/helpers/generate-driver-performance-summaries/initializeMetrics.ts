import { DriverPerformanceSummary } from "../../../functions/helpers/types/schema";

export type DriverMetrics = {
  completedDeliveries: number;
  totalDistance: number;
  totalFees: number;
  totalCommission: number;
  deliveryTimes: number[];
  onTimeCount: number;
};

export type RatingMetrics = {
  averageRating: number;
  reviewsCount: number;
};

export type DriverPerformanceSummaryMetrics = Omit<DriverPerformanceSummary, 'id' | 'createdAt' | 'updatedAt'>;

export const initializeDriverMetrics = (): DriverMetrics => ({
  completedDeliveries: 0,
  totalDistance: 0,
  totalFees: 0,
  totalCommission: 0,
  deliveryTimes: [],
  onTimeCount: 0
});
