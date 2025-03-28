import { Logger } from "@aws-lambda-powertools/logger";
import { MedicineOrderItem, PharmacyInventory } from "../../helpers/types/schema";

interface UpdateInventoriesInput {
  client: any;
  logger: Logger;
  orderId: string;
}

export const updateStockInventories = async ({ client, logger, orderId }: UpdateInventoriesInput) => {
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

  const promises = pharmacyInventories.map(async (inventory) => {
    const { errors } = await client.models.pharmacyInventory.update({
      id: inventory.id,
      reservedStock: inventory.reservedStock - inventoryRequirements[inventory.id]
    });

    if (errors) {
      logger.error(`Failed to update inventory stock, id: ${inventory.id}`, { errors });
      return;
    }
  });

  return await Promise.all(promises);

}