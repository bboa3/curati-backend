import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Address, Business, DeliveryStatus, MedicineOrder, MedicineOrderStatus, Patient, Professional, ProfessionalAvailabilityStatus } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";
import { deliveryDeliveredDriverEmailNotifier } from "../helpers/delivery-delivered-driver-email-notifier";
import { deliveryDeliveredPatientEmailNotifier } from "../helpers/delivery-delivered-patient-email-notifier";
import { deliveryDeliveredPharmacyEmailNotifier } from "../helpers/delivery-delivered-pharmacy-email-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryDelivered = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;
  const pharmacyId = deliveryImage?.pharmacyId?.S;
  const deliveryNumber = deliveryImage?.deliveryNumber?.S;
  const driverId = deliveryImage?.driverId?.S;
  const deliveredAt = deliveryImage?.deliveredAt?.S;

  if (!orderId || !patientId || !pharmacyId || !driverId || !deliveredAt || !deliveryNumber) {
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

  const { data: deliveryAddressData, errors: deliveryAddressErrors } = await dbClient.models.address.get({ addressOwnerId: orderId });

  if (deliveryAddressErrors || !deliveryAddressData) {
    throw new Error(`Failed to fetch delivery address: ${JSON.stringify(deliveryAddressErrors)}`);
  }
  const deliveryAddress = deliveryAddressData as unknown as Address;

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    throw new Error(`Failed to fetch pharmacy: ${JSON.stringify(pharmacyErrors)}`);
  }
  const pharmacy = pharmacyData as unknown as Business;

  const { errors: updateAvailabilityErrors } = await dbClient.models.professionalAvailability.update({
    professionalId: driverId,
    currentAvailabilityStatus: ProfessionalAvailabilityStatus.ONLINE
  });

  if (updateAvailabilityErrors) {
    throw new Error(`Failed to update driver availability: ${JSON.stringify(updateAvailabilityErrors)}`);
  }

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.DELIVERED
  })

  const orderDeepLink = `curati://life.curati.www/(app)/profile/orders/${orderId}`;
  const ratingDeepLink = `curati://life.curati.www/(app)/pharmacies/${pharmacyId}`;
  const driverStatsDeepLink = `curati://life.curati.go/(app)/`;

  if (patient.email) {
    await deliveryDeliveredPatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      deliveryNumber: deliveryNumber,
      driverName: driver.name,
      deliveredAt: deliveredAt,
      deliveryAddress,
      ratingDeepLink,
      orderDeepLink
    })
  }

  await deliveryDeliveredDriverEmailNotifier({
    driverName: driver.name,
    driverEmail: driver.email,
    pharmacyName: pharmacy.name,
    patientName: patient.name,
    orderNumber: order.orderNumber,
    deliveryNumber,
    deliveredAt,
    deliveryAddress,
    driverStatsDeepLink
  })

  await deliveryDeliveredPharmacyEmailNotifier({
    pharmacyName: pharmacy.name,
    pharmacyEmail: pharmacy.email,
    patientName: patient.name,
    orderNumber: order.orderNumber,
    deliveryNumber,
    driverName: driver.name,
    deliveredAt,
  })

  const { errors: orderUpdateErrors } = await dbClient.models.medicineOrder.update({
    id: orderId,
    status: MedicineOrderStatus.COMPLETED
  });

  if (orderUpdateErrors) {
    throw new Error(`Failed to update order: ${JSON.stringify(orderUpdateErrors)}`);
  }
};