import { Logger } from "@aws-lambda-powertools/logger";
import dayjs from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { DeliveryStatus, DeliveryStatusHistoryActorType } from "../../helpers/types/schema";

interface CreateDeliveryStatusHistoryInput {
  client: any;
  logger: Logger;
  patientId: string;
  deliveryId: string;
  status: DeliveryStatus;
}


export const createDeliveryStatusHistory = async ({ client, logger, patientId, deliveryId, status }: CreateDeliveryStatusHistoryInput) => {
  const deliveryStatusHistoryId = generateUUIDv4();
  const now = dayjs().utc();
  const { data, errors } = await client.models.deliveryStatusHistory.create({
    id: deliveryStatusHistoryId,
    deliveryId: deliveryId,
    patientId: patientId,
    status: status,
    timestamp: now.toISOString(),
    actorType: DeliveryStatusHistoryActorType.SYSTEM
  });

  if (errors || !data) {
    logger.error("Failed to create delivery status history", { errors });
    return;
  }

  return data;
} 