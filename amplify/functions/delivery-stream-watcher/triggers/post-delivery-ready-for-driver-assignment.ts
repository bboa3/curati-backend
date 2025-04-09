import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Address, DeliveryStatus, MedicineOrder, Patient, ProfessionalAvailabilityStatus } from "../../helpers/types/schema";
import { createDeliveryStatusHistory } from "../helpers/create-delivery-status-history";
import { deliveryDriverAssignedPatientEmailNotifier } from "../helpers/delivery-driver-assigned-patient-email-notifier";
import { deliveryDriverAssignedPatientSMSNotifier } from "../helpers/delivery-driver-assigned-patient-sms-notifier";
import { newDeliveryAssignmentDriverEmailNotifier } from "../helpers/new-delivery-assignment-driver-email-notifier";
import { newDeliveryAssignmentDriverSMSNotifier } from "../helpers/new-delivery-assignment-driver-sms-notifier";
import { pickBestDriver } from "../helpers/pickBestDriver";

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryReadyForDriverAssignment = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const orderId = deliveryImage?.orderId?.S;
  const deliveryNumber = deliveryImage?.deliveryNumber?.S;
  const patientId = deliveryImage?.patientId?.S;
  const pharmacyId = deliveryImage?.pharmacyId?.S;

  if (!orderId || !deliveryNumber || !patientId || !pharmacyId) {
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
    status: DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT
  })

  const deliveryDeepLink = `curati://life.curati.www/(app)/profile/deliveries/${orderId}`;

  const picked = await pickBestDriver({
    client: dbClient,
    logger: logger,
    pharmacyLocation: {
      lat: pharmacyAddressLatitude,
      lng: pharmacyAddressLongitude
    }
  })

  if (!picked) {
    logger.warn("No drivers are currently ONLINE.");
    return;
  }
  const { driver, vehicle } = picked;

  const { errors: availabilityUpdateErrors } = await dbClient.models.professionalAvailability.update({
    professionalId: driver.userId,
    currentAvailabilityStatus: ProfessionalAvailabilityStatus.BUSY
  });

  if (availabilityUpdateErrors) {
    logger.error("Failed to update driver availability", { errors: availabilityUpdateErrors });
    return null;
  }

  const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
    orderId,
    driverId: driver.userId,
    vehicleId: vehicle.id,
    courierId: driver.businessId,
    status: DeliveryStatus.DRIVER_ASSIGNED
  })

  if (deliveryUpdateErrors) {
    logger.error("Failed to update delivery", { errors: deliveryUpdateErrors });
    return;
  }

  await newDeliveryAssignmentDriverEmailNotifier({
    toAddresses: [driver.email],
    deliveryNumber: deliveryNumber,
    driverName: driver.name,
    deliveryDeepLink: deliveryDeepLink
  })

  await newDeliveryAssignmentDriverSMSNotifier({
    phoneNumber: `+258${driver.phone.replace(/\D/g, '')}`,
    deliveryNumber: deliveryNumber,
    deliveryDeepLink: deliveryDeepLink
  })

  if (patient.email) {
    await deliveryDriverAssignedPatientEmailNotifier({
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      patientName: patient.name,
      deliveryDeepLink: deliveryDeepLink
    })
  }

  await deliveryDriverAssignedPatientSMSNotifier({
    phoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
    orderNumber: order.orderNumber,
  })
};