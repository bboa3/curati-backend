import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Delivery, DeliveryStatus, DeliveryType, MedicineOrder } from "../../helpers/types/schema";
import { updatePrescriptionRefillsRemaining } from "../helpers/update-prescription-refills-remaining";
import { updateStockInventories } from '../helpers/update-stock-inventories';

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderReadyForDispatch = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const order = unmarshall(medicineOrderImage) as MedicineOrder;
  const { id: orderId, prescriptionId } = order;

  const { data: deliveryData, errors: deliveryErrors } = await dbClient.models.delivery.get({ orderId });

  if (deliveryErrors || !deliveryData) {
    throw new Error(`Failed to fetch delivery: ${JSON.stringify(deliveryErrors)}`);
  }
  const delivery = deliveryData as unknown as Delivery;

  if (delivery.type === DeliveryType.DELIVERY) {
    const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
      orderId,
      status: DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT
    });

    if (deliveryUpdateErrors) {
      throw new Error(`Failed to update delivery: ${JSON.stringify(deliveryUpdateErrors)}`);
    }

  } else {
    const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
      orderId,
      status: DeliveryStatus.AWAITING_PATIENT_PICKUP
    });

    if (deliveryUpdateErrors) {
      throw new Error(`Failed to update delivery: ${JSON.stringify(deliveryUpdateErrors)}`);
    }
  }

  await updateStockInventories({
    client: dbClient,
    orderId
  })

  if (prescriptionId) {
    await updatePrescriptionRefillsRemaining({
      client: dbClient,
      prescriptionId: prescriptionId
    })
  }
};