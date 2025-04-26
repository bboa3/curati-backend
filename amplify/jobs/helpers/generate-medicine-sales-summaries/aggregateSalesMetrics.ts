import { Logger } from "@aws-lambda-powertools/logger";
import { PharmacyInventory } from "../../../functions/helpers/types/schema";
import { initializeMetrics, SalesMetrics } from "./initializeMetrics";

interface TriggerInput {
  inventories: PharmacyInventory[];
  items: any[];
  logger: Logger;
}

export const aggregateSalesMetrics = ({ inventories, items, logger }: TriggerInput): Map<string, SalesMetrics> => {
  const aggregation = new Map<string, SalesMetrics>();

  inventories.forEach(inventory => { aggregation.set(inventory.id, initializeMetrics()) });

  items.forEach(item => {
    const entry = aggregation.get(item.pharmacyInventoryId);
    if (!entry) {
      logger.warn('Orphaned order item found', { itemId: item.id });
      return;
    }

    entry.unitsSold += item.quantity;
    entry.totalRevenue += item.unitPrice * item.quantity;
    entry.ordersCount.add(item.orderId);
  });

  return new Map(
    Array.from(aggregation.entries()).map(([id, metrics]) => [
      id,
      {
        ...metrics,
        ordersCount: metrics.ordersCount
      }
    ])
  );
};