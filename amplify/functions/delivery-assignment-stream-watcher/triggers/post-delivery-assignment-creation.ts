import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Delivery, DeliveryAssignment, Professional } from "../../helpers/types/schema";
import { createDeliveryAssignmentCreatedNotification } from "../helpers/create-delivery-assignment-created-notification";

interface TriggerInput {
  deliveryAssignmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryAssignmentCreation = async ({ deliveryAssignmentImage, dbClient }: TriggerInput) => {
  const deliveryAssignment = unmarshall(deliveryAssignmentImage as any) as DeliveryAssignment;
  const { deliveryId, driverId } = deliveryAssignment;

  const { data: driverData, errors: driverErrors } = await dbClient.models.professional.get({ userId: driverId });

  if (driverErrors || !driverData) {
    throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(driverErrors)}`);
  }
  const driver = driverData as unknown as Professional;

  const { data: deliveryData, errors: deliveryErrors } = await dbClient.models.delivery.get({ orderId: deliveryId });

  if (deliveryErrors || !deliveryData) {
    throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(driverErrors)}`);
  }
  const delivery = deliveryData as unknown as Delivery;

  await createDeliveryAssignmentCreatedNotification({
    dbClient,
    delivery,
    driver
  });
};