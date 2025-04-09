import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { DeliveryStatus } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryCreation = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;

  if (!orderId || !patientId) {
    logger.warn("Missing required order fields");
    return;
  }

  await createDeliveryStatusHistory({
    client: dbClient,
    logger,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.PENDING
  })
};