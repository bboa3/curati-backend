import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { createDeliveryStatusHistory } from "../../helpers/create-delivery-status-history";
import { Address, Business, Delivery, DeliveryStatus, MedicineOrder, Patient } from "../../helpers/types/schema";
import { deliveryReadyForPickupPatientEmailNotifier } from "../helpers/delivery-ready-for-pickup-patient-email-notifier";
import { deliveryReadyForPickupPatientSMSNotifier } from "../helpers/delivery-ready-for-pickup-patient-sms-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryReadyForPatientPickup = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const delivery = unmarshall(deliveryImage as any) as Delivery;
  const { orderId, patientId, pharmacyId } = delivery;

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
    status: DeliveryStatus.AWAITING_PATIENT_PICKUP,
    latitude: pharmacyAddressLatitude,
    longitude: pharmacyAddressLongitude
  })

  if (patient.email) {
    await deliveryReadyForPickupPatientEmailNotifier({
      patientEmail: patient.email,
      pharmacyAddress: pharmacyAddress,
      pharmacyName: pharmacy.name,
      orderNumber: order.orderNumber,
      patientName: patient.name,
    })
  }

  await deliveryReadyForPickupPatientSMSNotifier({
    phoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
    pharmacyName: pharmacy.name,
    orderNumber: order.orderNumber,
  })
};