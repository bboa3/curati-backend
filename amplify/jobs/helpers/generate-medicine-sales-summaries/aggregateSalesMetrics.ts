import { MedicineOrderItem } from "../../../functions/helpers/types/schema";
import { SalesMetrics, initializeMetrics } from "./initializeMetrics";

export const aggregateSalesMetrics = (items: MedicineOrderItem[]): Map<string, SalesMetrics> => {
  return items.reduce((acc, item) => {
    const existing = acc.get(item.pharmacyInventoryId) || initializeMetrics();

    acc.set(item.pharmacyInventoryId, {
      totalRevenue: existing.totalRevenue + (item.unitPrice * item.quantity),
      totalUnits: existing.totalUnits + item.quantity,
      orderIds: new Set([...existing.orderIds, item.orderId]),
    });

    return acc;
  }, new Map<string, SalesMetrics>());
};