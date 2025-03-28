import { Logger } from "@aws-lambda-powertools/logger";
import { Schema } from "../../../data/resource";

interface ReserveStockInventoriesInput {
  client: any;
  logger: Logger;
  orderId: string;
}
type MedicineOrderItem = Schema['medicineOrderItem']['type'];
type PharmacyInventory = Schema['pharmacyInventory']['type'];

export const reserveStockInventories = async ({ client, logger, orderId }: ReserveStockInventoriesInput) => {
  const { data: medicineOrderItems, errors: itemsErrors } = await client.models.medicineOrderItem.list({
    filter: { orderId: { eq: orderId } }
  });

  if (itemsErrors || !medicineOrderItems) {
    logger.error("Failed to fetch medicine order items", { errors: itemsErrors });
    return;
  }
  const items = medicineOrderItems as MedicineOrderItem[] || [];

  const inventoryRequirements = items.reduce((acc, item) => {
    acc[item.pharmacyInventoryId] = (acc[item.pharmacyInventoryId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const inventoryIds = Object.keys(inventoryRequirements);

  const inventoryFilters = inventoryIds.map(id => ({ id: { eq: id } }));

  const { data: pharmacyInventoriesData, errors: inventoriesErrors } = await client.models.pharmacyInventory.list({
    filter: { or: inventoryFilters }
  });

  if (inventoriesErrors || !pharmacyInventoriesData) {
    logger.error("Failed to fetch pharmacy inventories", { errors: inventoriesErrors });
    return;
  }
  const pharmacyInventories = pharmacyInventoriesData as PharmacyInventory[] || [];

  const hasAllMedicines = pharmacyInventories && inventoryIds.every(inventoryId => {
    const inventory = pharmacyInventories.find(inv => inv.id === inventoryId);
    return inventory &&
      (inventory.stock - inventory.reservedStock) >= inventoryRequirements[inventoryId];
  });

  if (!hasAllMedicines) {
    logger.error("Failed to update inventories. Not enough stock");
    return;
  };

  const promises = pharmacyInventories.map(async (inventory) => {
    const { errors } = await client.models.pharmacyInventory.update({
      id: inventory.id,
      stock: inventory.stock - inventoryRequirements[inventory.id],
      reservedStock: inventory.reservedStock + inventoryRequirements[inventory.id]
    });

    if (errors) {
      logger.error(`Failed to update inventory stock, id: ${inventory.id}`, { errors });
      return;
    }
  });

  return await Promise.all(promises);

}