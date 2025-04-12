import { Schema } from "../../../data/resource";

interface ReserveStockInventoriesInput {
  client: any;
  orderId: string;
}
type MedicineOrderItem = Schema['medicineOrderItem']['type'];
type PharmacyInventory = Schema['pharmacyInventory']['type'];

export const reserveStockInventories = async ({ client, orderId }: ReserveStockInventoriesInput) => {
  const { data: medicineOrderItems, errors: itemsErrors } = await client.models.medicineOrderItem.list({
    filter: { orderId: { eq: orderId } }
  });

  if (itemsErrors || !medicineOrderItems) {
    throw new Error(`Failed to fetch order items: ${JSON.stringify(itemsErrors)}`);
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
    throw new Error(`Failed to fetch pharmacy inventories: ${JSON.stringify(inventoriesErrors)}`);
  }
  const pharmacyInventories = pharmacyInventoriesData as PharmacyInventory[] || [];

  const hasAllMedicines = pharmacyInventories && inventoryIds.every(inventoryId => {
    const inventory = pharmacyInventories.find(inv => inv.id === inventoryId);
    return inventory &&
      (inventory.stock - inventory.reservedStock) >= inventoryRequirements[inventoryId];
  });

  if (!hasAllMedicines) {
    throw new Error("Not enough stock");
  };

  const promises = pharmacyInventories.map(async (inventory) => {
    const { errors } = await client.models.pharmacyInventory.update({
      id: inventory.id,
      stock: inventory.stock - inventoryRequirements[inventory.id],
      reservedStock: inventory.reservedStock + inventoryRequirements[inventory.id]
    });

    if (errors) {
      throw new Error(`Failed to update pharmacy inventory: ${JSON.stringify(errors)}`);
    }
  });

  return await Promise.all(promises);

}