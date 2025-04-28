import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { createDeliveryStatusHistory } from "../../helpers/create-delivery-status-history";
import { Address, Delivery, DeliveryStatus, DeliveryType, MedicineOrder } from "../../helpers/types/schema";
import { updatePrescriptionRefillsRemaining } from "../helpers/update-prescription-refills-remaining";
import { updateStockInventories } from '../helpers/update-stock-inventories';

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderReadyForDispatch = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const order = unmarshall(medicineOrderImage) as MedicineOrder;
  const { id: orderId, patientId, prescriptionId, businessId } = order;

  const { data: deliveryData, errors: deliveryErrors } = await dbClient.models.delivery.get({ orderId });

  if (deliveryErrors || !deliveryData) {
    throw new Error(`Failed to fetch delivery: ${JSON.stringify(deliveryErrors)}`);
  }
  const delivery = deliveryData as unknown as Delivery;

  const { data: pharmacyAddressData, errors: pharmacyAddressErrors } = await dbClient.models.address.get({ addressOwnerId: businessId });
  const pharmacyAddress = pharmacyAddressData as unknown as Address
  const pharmacyAddressLatitude = pharmacyAddress?.latitude;
  const pharmacyAddressLongitude = pharmacyAddress?.longitude;

  if (pharmacyAddressErrors || !pharmacyAddress || !pharmacyAddressLongitude || !pharmacyAddressLatitude) {
    throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(pharmacyAddressErrors)}`);
  }

  if (delivery.type === DeliveryType.DELIVERY) {
    const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
      orderId,
      status: DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT
    });

    if (deliveryUpdateErrors) {
      throw new Error(`Failed to update delivery: ${JSON.stringify(deliveryUpdateErrors)}`);
    }

    await createDeliveryStatusHistory({
      client: dbClient,
      patientId: patientId,
      deliveryId: orderId,
      status: DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT,
      latitude: pharmacyAddressLatitude,
      longitude: pharmacyAddressLongitude
    })

  } else {
    const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
      orderId,
      status: DeliveryStatus.AWAITING_PATIENT_PICKUP
    });

    if (deliveryUpdateErrors) {
      throw new Error(`Failed to update delivery: ${JSON.stringify(deliveryUpdateErrors)}`);
    }

    await createDeliveryStatusHistory({
      client: dbClient,
      patientId: patientId,
      deliveryId: orderId,
      status: DeliveryStatus.AWAITING_PATIENT_PICKUP,
      latitude: pharmacyAddressLatitude,
      longitude: pharmacyAddressLongitude
    })
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