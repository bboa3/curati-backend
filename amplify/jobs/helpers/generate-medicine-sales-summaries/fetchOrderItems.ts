import { MedicineOrder } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  orders: MedicineOrder[];
}

export const fetchOrderItems = async ({ orders }: TriggerInput) => {
  const itemsArrays = await Promise.all(
    orders.map(async (order) => {
      const { data, errors } = await order.items({ limit: 1000 });
      if (errors) throw new Error(`Failed to fetch order items: ${JSON.stringify(errors)}`);
      return data;
    })
  );
  return itemsArrays.flat();
};