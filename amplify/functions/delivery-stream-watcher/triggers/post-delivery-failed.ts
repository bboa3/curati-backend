import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Business, Delivery, DeliveryStatus, MedicineOrder, Patient, Professional } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";
import { deliveryFailedDriverEmailNotifier } from "../helpers/delivery-failed-driver-email-notifier";
import { deliveryFailedPatientEmailNotifier } from "../helpers/delivery-failed-patient-email-notifier";
import { deliveryFailedPharmacyEmailNotifier } from "../helpers/delivery-failed-pharmacy-email-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryFailed = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const delivery = unmarshall(deliveryImage) as Delivery;
  const { orderId, patientId, pharmacyId, driverId, status: deliveryStatus, deliveryNumber } = delivery;

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

  if (driverErrors) {
    throw new Error(`Failed to fetch driver: ${JSON.stringify(driverErrors)}`);
  }
  const driver = driverData as unknown as Professional | null;

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    throw new Error(`Failed to fetch pharmacy: ${JSON.stringify(pharmacyErrors)}`);
  }
  const pharmacy = pharmacyData as unknown as Business;

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.FAILED
  })

  const orderDeepLink = `curati://life.curati.www/(app)/profile/orders/${orderId}`;
  const deliveryDeepLink = `curati://life.curati.go/(app)/profile/deliveries/${orderId}`;

  if (patient.email) {
    await deliveryFailedPatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      deliveryNumber: deliveryNumber,
      orderDeepLink,
      finalStatus: deliveryStatus,
    })
  }

  if (driver) {
    await deliveryFailedDriverEmailNotifier({
      driverName: driver.name,
      driverEmail: driver.email,
      patientName: patient.name,
      orderNumber: order.orderNumber,
      deliveryNumber,
      finalStatus: deliveryStatus,
      deliveryDeepLink,
    })
  }

  await deliveryFailedPharmacyEmailNotifier({
    pharmacyName: pharmacy.name,
    pharmacyEmail: pharmacy.email,
    patientName: patient.name,
    orderNumber: order.orderNumber,
    deliveryNumber,
    driverName: driver?.name,
    finalStatus: deliveryStatus,
  })
};