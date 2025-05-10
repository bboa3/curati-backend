import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { MedicineOrder } from "../../helpers/types/schema";
import { cancelReservedStockInventories } from "../helpers/cancel-reserved-stock-inventories";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderCancellation = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const order = unmarshall(medicineOrderImage as any) as MedicineOrder;
  const { id: orderId } = order;

  await cancelReservedStockInventories({
    client: dbClient,
    orderId
  })
};