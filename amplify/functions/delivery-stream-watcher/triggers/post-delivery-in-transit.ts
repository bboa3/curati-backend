import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { DeliveryStatus, MedicineOrder, Patient, Professional } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";
import { deliveryInTransitPatientEmailNotifier } from "../helpers/delivery-in-transit-patient-email-notifier";
import { deliveryInTransitPatientSMSNotifier } from "../helpers/delivery-in-transit-patient-sms-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryInTransit = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;
  const pharmacyId = deliveryImage?.pharmacyId?.S;
  const pickedUpAt = deliveryImage?.pickedUpAt?.S;
  const deliveryNumber = deliveryImage?.deliveryNumber?.S;
  const driverId = deliveryImage?.driverId?.S;
  const vehicleId = deliveryImage?.vehicleId?.S;
  const estimatedDeliveryDuration = deliveryImage?.estimatedDeliveryDuration?.N;

  if (!orderId || !patientId || !pharmacyId || !driverId || !vehicleId || !estimatedDeliveryDuration || !pickedUpAt || !deliveryNumber) {
    throw new Error("Missing required order fields");
  }

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

  const { data: driverData, errors: driverErrors } = await dbClient.models.professional.get({ userId: driverId });

  if (driverErrors || !driverData) {
    throw new Error(`Failed to fetch driver: ${JSON.stringify(driverErrors)}`);
  }
  const driver = driverData as unknown as Professional;

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.IN_TRANSIT
  })

  const trackingLink = `curati://life.curati.www/(app)/profile/deliveries/${orderId}`;

  if (patient.email) {
    await deliveryInTransitPatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      deliveryNumber: deliveryNumber,
      driverName: driver.name,
      pickedUpAt: pickedUpAt,
      estimatedDeliveryDuration: Number(estimatedDeliveryDuration),
      trackingLink,
    })
  }

  await deliveryInTransitPatientSMSNotifier({
    patientPhoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
    orderNumber: order.orderNumber,
    driverName: driver.name,
    pickedUpAt: pickedUpAt,
    estimatedDeliveryDuration: Number(estimatedDeliveryDuration),
    trackingLink: trackingLink
  })
};