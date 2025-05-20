import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { createDeliveryStatusHistory } from "../../helpers/create-delivery-status-history";
import { Address, Business, Delivery, DeliveryStatus, MedicineOrder, MedicineOrderStatus, Patient } from "../../helpers/types/schema";
import { createDeliveryStatusPatientUpdateNotification } from "../helpers/create-delivery-status-patient-update-notification";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryPickedUpByPatient = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const delivery = unmarshall(deliveryImage as any) as Delivery;
  const { orderId, patientId, pharmacyId, deliveredAt } = delivery;

  const { data: orderData, errors: orderErrors } = await dbClient.models.medicineOrder.get({ id: orderId });

  if (orderErrors || !orderData) {
    throw new Error(`Failed to fetch order: ${JSON.stringify(orderErrors)}`);
  }
  const order = orderData as unknown as MedicineOrder

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient;

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    throw new Error(`Failed to fetch pharmacy: ${JSON.stringify(pharmacyErrors)}`);
  }
  const pharmacy = pharmacyData as unknown as Business;

  const { data: pharmacyAddressData, errors: pharmacyAddressErrors } = await dbClient.models.address.get({ addressOwnerId: pharmacyId });

  if (pharmacyAddressErrors || !pharmacyAddressData) {
    throw new Error(`Failed to fetch delivery address: ${JSON.stringify(pharmacyAddressErrors)}`);
  }
  const pharmacyAddress = pharmacyAddressData as unknown as Address;

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.PICKED_UP_BY_PATIENT,
    latitude: pharmacy.businessLatitude,
    longitude: pharmacy.businessLongitude
  })

  await createDeliveryStatusPatientUpdateNotification({
    dbClient,
    delivery,
    patient,
    pharmacy,
    pharmacyAddress,
    driver: null,
    order
  });

  const { errors: orderUpdateErrors } = await dbClient.models.medicineOrder.update({
    id: orderId,
    status: MedicineOrderStatus.COMPLETED
  });

  if (orderUpdateErrors) {
    throw new Error(`Failed to update order: ${JSON.stringify(orderUpdateErrors)}`);
  }
};