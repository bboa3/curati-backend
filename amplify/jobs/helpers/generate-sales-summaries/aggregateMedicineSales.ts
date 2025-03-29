import { Dayjs } from "dayjs";
import { MedicineOrder, MedicineOrderStatus } from "../../../functions/helpers/types/schema";

interface AggregatorInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
}

export const aggregateMedicineSales = async ({ businessId, periodStart, periodEnd, dbClient }: AggregatorInput) => {
  const { data: ordersData, errors: orderErrors } = await dbClient.models.medicineOrder.list({
    filter: {
      businessId: { eq: businessId },
      status: { eq: MedicineOrderStatus.COMPLETED },
      createdAt: {
        between: [periodStart.toISOString(), periodEnd.toISOString()]
      }
    }
  });

  if (!ordersData || ordersData.length === 0) return null;

  if (orderErrors) throw new Error(JSON.stringify(orderErrors));
  const orders = ordersData as MedicineOrder[];

  const items = (await Promise.all(
    orders.map(async (order) => {
      const { data, errors } = await order.items({ limit: 1000 })
      if (errors) throw new Error(JSON.stringify(errors));

      return data;
    })
  )).flat();

  return items.reduce((acc, item) => {
    const existing = acc.get(item.pharmacyInventoryId) || {
      totalRevenue: 0,
      totalUnits: 0,
      count: 0
    };

    acc.set(item.pharmacyInventoryId, {
      totalRevenue: existing.totalRevenue + (item.unitPrice * item.quantity),
      totalUnits: existing.totalUnits + item.quantity,
      count: existing.count + 1
    });

    return acc;
  }, new Map<string, { totalRevenue: number; totalUnits: number; count: number }>());
};
