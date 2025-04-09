import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Address, Business, DeliveryStatus, MedicineOrder, Patient } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";
import { deliveryReadyForPickupPatientEmailNotifier } from "../helpers/delivery-ready-for-pickup-patient-email-notifier";
import { deliveryReadyForPickupPatientSMSNotifier } from "../helpers/delivery-ready-for-pickup-patient-sms-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryReadyForPatientPickup = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;
  const pharmacyId = deliveryImage?.pharmacyId?.S;

  if (!orderId || !patientId || !pharmacyId) {
    logger.warn("Missing required order fields");
    return;
  }

  const { data: orderData, errors: orderErrors } = await dbClient.models.medicineOrder.get({ id: orderId });

  if (orderErrors || !orderData) {
    logger.error("Failed to fetch order", { errors: orderErrors });
    return;
  }
  const order = orderData as unknown as MedicineOrder

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
  }
  const patient = patientData as unknown as Patient;

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    logger.error("Failed to fetch pharmacy", { errors: pharmacyErrors });
    return;
  }
  const pharmacy = pharmacyData as unknown as Business;

  const { data: pharmacyAddressData, errors: pharmacyAddressErrors } = await dbClient.models.address.get({ addressOwnerId: pharmacyId });
  const pharmacyAddress = pharmacyAddressData as unknown as Address
  const pharmacyAddressLatitude = pharmacyAddress?.latitude;
  const pharmacyAddressLongitude = pharmacyAddress?.longitude;

  if (pharmacyAddressErrors || !pharmacyAddress || !pharmacyAddressLongitude || !pharmacyAddressLatitude) {
    logger.error("Failed to fetch pharmacy address", { errors: pharmacyAddressErrors });
    return;
  }

  await createDeliveryStatusHistory({
    client: dbClient,
    logger,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.AWAITING_PATIENT_PICKUP
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