import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Business, DeliveryStatus, MedicineOrder, Patient, Professional, Vehicle } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";
import { deliveryPickedUpByDriverPatientEmailNotifier } from "../helpers/delivery-picked-up-by-driver-patient-email-notifier";
import { deliveryPickedUpByDriverPatientSMSNotifier } from "../helpers/delivery-picked-up-by-driver-patient-sms-notifier";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryPickedUpByDriver = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const patientId = deliveryImage?.patientId?.S;
  const pharmacyId = deliveryImage?.pharmacyId?.S;
  const pickedUpAt = deliveryImage?.pickedUpAt?.S;
  const deliveryNumber = deliveryImage?.deliveryNumber?.S;
  const driverId = deliveryImage?.driverId?.S;
  const vehicleId = deliveryImage?.vehicleId?.S;
  const estimatedDeliveryDuration = deliveryImage?.estimatedDeliveryDuration?.N;

  if (!orderId || !patientId || !pharmacyId || !driverId || !vehicleId || !estimatedDeliveryDuration || !pickedUpAt || !deliveryNumber) {
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

  const { data: driverData, errors: driverErrors } = await dbClient.models.professional.get({ userId: driverId });

  if (driverErrors || !driverData) {
    logger.error("Failed to fetch driver", { errors: driverErrors });
    return;
  }
  const driver = driverData as unknown as Professional;

  const { data: vehicleData, errors: vehicleErrors } = await dbClient.models.vehicle.get({ id: vehicleId });

  if (vehicleErrors || !vehicleData) {
    logger.error("Failed to fetch vehicle", { errors: vehicleErrors });
    return;
  }
  const vehicle = vehicleData as unknown as Vehicle;

  await createDeliveryStatusHistory({
    client: dbClient,
    logger,
    patientId: patientId,
    deliveryId: orderId,
    status: DeliveryStatus.PICKED_UP_BY_DRIVER
  })

  const trackingLink = `curati://life.curati.www/(app)/profile/deliveries/${orderId}`;

  if (patient.email) {
    await deliveryPickedUpByDriverPatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      deliveryNumber: deliveryNumber,
      pharmacyName: pharmacy.name,
      driverName: driver.name,
      vehicleModel: vehicle.model,
      vehicleLicensePlate: vehicle.licensePlate,
      vehicleType: vehicle.type,
      pickedUpAt: pickedUpAt,
      estimatedDeliveryDuration: Number(estimatedDeliveryDuration),
      trackingLink,
    })
  }

  await deliveryPickedUpByDriverPatientSMSNotifier({
    patientPhoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
    orderNumber: order.orderNumber,
    driverName: driver.name,
    pickedUpAt: pickedUpAt,
    estimatedDeliveryDuration: Number(estimatedDeliveryDuration),
    trackingLink: trackingLink
  })
};