import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { DeliveryStatus } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryCreation = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;

  if (!orderId || !patientId) {
    throw new Error("Missing required order fields");
  }

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.PENDING
  })
};