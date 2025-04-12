import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { cancelReservedStockInventories } from "../helpers/cancel-reserved-stock-inventories";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderCancellation = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const orderId = medicineOrderImage?.id?.S;

  if (!orderId) {
    throw new Error("Missing required order fields");
  }

  await cancelReservedStockInventories({
    client: dbClient,
    orderId
  })
};