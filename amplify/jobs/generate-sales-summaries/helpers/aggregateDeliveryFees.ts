import { Dayjs } from "dayjs";
import { Delivery, DeliveryStatus } from "../../../functions/helpers/types/schema";

interface AggregatorInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
}

export const aggregateDeliveryFees = async ({ businessId, periodStart, periodEnd, dbClient }: AggregatorInput) => {
  const { data: deliveriesData, errors: deliveriesErrors } = await dbClient.models.delivery.list({
    filter: {
      courierId: { eq: businessId },
      status: { eq: DeliveryStatus.DELIVERED },
      deliveredAt: {
        between: [periodStart.toISOString(), periodEnd.toISOString()]
      }
    }
  });

  if (!deliveriesData || deliveriesData.length === 0) return null;

  if (deliveriesErrors) throw new Error(JSON.stringify(deliveriesErrors));
  const deliveries = deliveriesData as Delivery[];

  return deliveries.reduce((acc, delivery) => {
    const driverId = delivery.driverId || 'unassigned';
    const existing = acc.get(driverId) || {
      totalRevenue: 0,
      count: 0,
      totalUnits: 0,
      averageFee: 0
    };

    const totalFee = delivery.totalDeliveryFee + delivery.specialHandlingFee;

    acc.set(driverId, {
      totalRevenue: existing.totalRevenue + totalFee,
      count: existing.count + 1,
      totalUnits: existing.totalUnits + 1,
      averageFee: (existing.totalRevenue + totalFee) / (existing.count + 1)
    });

    return acc;
  }, new Map<string, {
    totalRevenue: number;
    count: number;
    totalUnits: number;
    averageFee: number;
  }>());
};