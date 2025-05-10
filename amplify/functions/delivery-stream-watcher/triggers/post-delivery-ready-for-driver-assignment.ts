import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Address, Delivery } from "../../helpers/types/schema";
import { createDeliveryOpportunities } from "../helpers/create-delivery-opportunities";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryReadyForDriverAssignment = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const delivery = unmarshall(deliveryImage as any) as Delivery;
  const { pharmacyId } = delivery;

  const { data: pharmacyAddressData, errors: pharmacyAddressErrors } = await dbClient.models.address.get({ addressOwnerId: pharmacyId });
  const pharmacyAddress = pharmacyAddressData as unknown as Address

  if (pharmacyAddressErrors || !pharmacyAddress) {
    throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(pharmacyAddressErrors)}`);
  }

  const { data: deliveryAddressData, errors: deliveryAddressErrors } = await dbClient.models.address.get({ addressOwnerId: delivery.orderId });
  const deliveryAddress = deliveryAddressData as unknown as Address

  if (deliveryAddressErrors || !deliveryAddress) {
    throw new Error(`Failed to fetch delivery address: ${JSON.stringify(deliveryAddressErrors)}`);
  }

  await createDeliveryOpportunities({
    dbClient: dbClient,
    logger: logger,
    delivery,
    pharmacyAddress,
    deliveryAddress
  })
};