import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { createMedicineOrderInvoice } from '../helpers/create-invoice';
import { reserveStockInventories } from '../helpers/reserve-stock-inventories';

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderCreation = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;
  const pharmacyId = deliveryImage?.pharmacyId?.S;
  const totalDeliveryFee = deliveryImage?.totalDeliveryFee?.N;

  if (!orderId || !totalDeliveryFee || !patientId || !pharmacyId) {
    logger.warn("Missing required order fields");
    return;
  }

  await reserveStockInventories({
    client: dbClient,
    logger,
    orderId
  })

  await createMedicineOrderInvoice({
    client: dbClient,
    logger,
    orderId,
    totalDeliveryFee: Number(totalDeliveryFee),
    pharmacyId: pharmacyId,
    patientId: patientId
  });
};