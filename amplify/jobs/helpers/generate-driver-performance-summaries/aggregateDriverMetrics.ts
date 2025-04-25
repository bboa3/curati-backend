import { Delivery } from "../../../functions/helpers/types/schema";
import { calculateCommission, calculateDeliveryDuration } from "./calculator";
import { checkOnTimeDelivery } from "./checkOnTimeDelivery";
import { DriverMetrics, initializeDriverMetrics } from "./initializeMetrics";

interface AggregatorInput {
  deliveries: Delivery[];
  commissionPercentage: number;
}

export const aggregateDriverMetrics = ({ deliveries, commissionPercentage }: AggregatorInput): Map<string, DriverMetrics> => {
  return deliveries.reduce((acc, delivery) => {
    if (!delivery.driverId) return acc;

    const driverId = delivery.driverId;
    const existing = acc.get(driverId) || initializeDriverMetrics();

    const duration = calculateDeliveryDuration(
      delivery.pickedUpAt || undefined,
      delivery.deliveredAt || undefined
    );

    const isOnTime = checkOnTimeDelivery({
      startWindow: delivery.preferredDeliveryTimeStartAt,
      endWindow: delivery.preferredDeliveryTimeEndAt,
      deliveredAt: delivery.deliveredAt || undefined
    });

    return acc.set(driverId, {
      completedDeliveries: existing.completedDeliveries + 1,
      totalDistance: existing.totalDistance + (delivery.distanceInKm || 0),
      totalFees: existing.totalFees + (delivery.totalDeliveryFee || 0),
      totalCommission: existing.totalCommission + calculateCommission(delivery, commissionPercentage),
      deliveryTimes: [...existing.deliveryTimes, duration],
      onTimeCount: isOnTime ? existing.onTimeCount + 1 : existing.onTimeCount,
    });
  }, new Map<string, DriverMetrics>());
};