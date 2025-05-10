import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import dayjs from "dayjs";
import { createDeliveryStatusHistory } from "../../helpers/create-delivery-status-history";
import { Business, Delivery, DeliveryStatus, DriverCurrentLocation, MedicineOrder, Patient, Professional, ProfessionalAvailabilityStatus } from "../../helpers/types/schema";
import { deliveryPickedUpByDriverPatientEmailNotifier } from "../helpers/delivery-picked-up-by-driver-patient-email-notifier";
import { deliveryPickedUpByDriverPatientSMSNotifier } from "../helpers/delivery-picked-up-by-driver-patient-sms-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryPickedUpByDriver = async ({ deliveryImage, dbClient }: TriggerInput) => {
  const delivery = unmarshall(deliveryImage as any) as Delivery;
  const { orderId, patientId, pharmacyId, driverId, vehicleId, estimatedDeliveryDuration, pickedUpAt, deliveryNumber } = delivery;

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

  const { data: driverData, errors: driverErrors } = await dbClient.models.professional.get({ userId: driverId });

  if (driverErrors || !driverData) {
    throw new Error(`Failed to fetch driver: ${JSON.stringify(driverErrors)}`);
  }
  const driver = driverData as unknown as Professional;

  const { data: driverCurrentLocationData, errors: driverCurrentLocationErrors } = await dbClient.models.driverCurrentLocation.get({ driverId: driverId });

  if (driverCurrentLocationErrors || !driverCurrentLocationData) {
    throw new Error(`Failed to fetch delivery address: ${JSON.stringify(driverCurrentLocationErrors)}`);
  }

  const driverCurrentLocation = driverCurrentLocationData as unknown as DriverCurrentLocation;

  await createDeliveryStatusHistory({
    client: dbClient,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.PICKED_UP_BY_DRIVER,
    latitude: driverCurrentLocation.latitude,
    longitude: driverCurrentLocation.longitude
  })

  const { errors: availabilityUpdateErrors } = await dbClient.models.professionalAvailability.update({
    professionalId: driverId,
    currentAvailabilityStatus: ProfessionalAvailabilityStatus.BUSY
  });

  if (availabilityUpdateErrors) {
    throw new Error(`Failed to update driver availability: ${JSON.stringify(availabilityUpdateErrors)}`);
  }

  const trackingLink = `curati://life.curati.www/(app)/profile/deliveries/${orderId}`;

  if (patient.email) {
    await deliveryPickedUpByDriverPatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      deliveryNumber: deliveryNumber,
      pharmacyName: pharmacy.name,
      driverName: driver.name,
      pickedUpAt: pickedUpAt || dayjs().utc().toISOString(),
      estimatedDeliveryDuration: Number(estimatedDeliveryDuration),
      trackingLink,
    })
  }

  await deliveryPickedUpByDriverPatientSMSNotifier({
    patientPhoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
    orderNumber: order.orderNumber,
    driverName: driver.name,
    pickedUpAt: pickedUpAt || dayjs().utc().toISOString(),
    estimatedDeliveryDuration: Number(estimatedDeliveryDuration),
    trackingLink: trackingLink
  })
};