import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { createDeliveryStatusHistory } from "../../helpers/create-delivery-status-history";
import { Address, Delivery, DeliveryStatus } from "../../helpers/types/schema";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryCreation = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const delivery = unmarshall(deliveryImage as any) as Delivery;
  const { orderId, patientId, pharmacyId } = delivery;

  const { data: pharmacyAddressData, errors: pharmacyAddressErrors } = await dbClient.models.address.get({ addressOwnerId: pharmacyId });
  const pharmacyAddress = pharmacyAddressData as unknown as Address
  const pharmacyAddressLatitude = pharmacyAddress?.latitude;
  const pharmacyAddressLongitude = pharmacyAddress?.longitude;

  if (pharmacyAddressErrors || !pharmacyAddress || !pharmacyAddressLongitude || !pharmacyAddressLatitude) {
    throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(pharmacyAddressErrors)}`);
  }

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.PENDING,
    latitude: pharmacyAddressLatitude,
    longitude: pharmacyAddressLongitude
  })
};