import { Delivery } from "../../../functions/helpers/types/schema";
import { calculateCommission, calculateDeliveryDuration } from "./calculator";
import { checkOnTimeDelivery } from "./checkOnTimeDelivery";
import { DriverMetrics, initializeDriverMetrics } from "./initializeMetrics";

interface AggregatorInput {
  deliveries: Delivery[];
  commissionPercentage: number;
}

export const aggregateDriverMetrics = ({ deliveries, commissionPercentage }: AggregatorInput): DriverMetrics => {
  return deliveries.reduce((metrics, delivery) => {
    const duration = calculateDeliveryDuration(
      delivery.pickedUpAt || undefined,
      delivery.deliveredAt || undefined
    );

    const isOnTime = checkOnTimeDelivery({
      startWindow: delivery.preferredDeliveryTimeStartAt,
      endWindow: delivery.preferredDeliveryTimeEndAt,
      deliveredAt: delivery.deliveredAt || undefined
    });

    return {
      completedDeliveries: metrics.completedDeliveries + 1,
      totalDistance: metrics.totalDistance + (delivery.distanceInKm || 0),
      totalFees: metrics.totalFees + (delivery.totalDeliveryFee || 0),
      totalCommission: metrics.totalCommission + calculateCommission(delivery, commissionPercentage),
      deliveryTimes: [...metrics.deliveryTimes, duration],
      onTimeCount: isOnTime ? metrics.onTimeCount + 1 : metrics.onTimeCount,
    }
  }, initializeDriverMetrics());
};