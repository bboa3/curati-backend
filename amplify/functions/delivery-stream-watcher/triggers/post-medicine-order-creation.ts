import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Delivery, MedicineOrder } from "../../helpers/types/schema";
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
  const delivery = unmarshall(deliveryImage) as Delivery;

  logger.error("delivery", JSON.stringify(delivery));

  if (!orderId || !totalDeliveryFee || !patientId || !pharmacyId) {
    throw new Error("Missing required order fields");
  }

  const { data: orderData, errors: orderErrors } = await dbClient.models.medicineOrder.get({ id: orderId });

  if (orderErrors || !orderData) {
    throw new Error(`Failed to fetch order: ${JSON.stringify(orderErrors)}`);
  }
  const order = orderData as unknown as MedicineOrder

  await reserveStockInventories({
    client: dbClient,
    orderId
  })

  await createMedicineOrderInvoice({
    client: dbClient,
    orderId,
    paymentMethodId: order.paymentMethodId,
    totalDeliveryFee: Number(totalDeliveryFee),
    pharmacyId: pharmacyId,
    patientId: patientId
  });
};