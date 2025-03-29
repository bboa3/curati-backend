import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Address, Delivery, DeliveryStatus, DeliveryType, Patient, Professional, Vehicle } from "../../helpers/types/schema";
import { newDeliveryAssignmentDriverEmailNotifier } from "../helpers/new-delivery-assignment-driver-email-notifier";
import { newDeliveryAssignmentDriverSMSNotifier } from "../helpers/new-delivery-assignment-driver-sms-notifier";
import { newDeliveryAssignmentPatientEmailNotifier } from "../helpers/new-delivery-assignment-patient-email-notifier";
import { newDeliveryAssignmentPatientSMSNotifier } from "../helpers/new-delivery-assignment-patient-sms-notifier";
import { pickBestDriver } from "../helpers/pickBestDriver";
import { updatePrescriptionRefillsRemaining } from "../helpers/update-prescription-refills-remaining";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderReadyForDispatch = async ({ medicineOrderImage, dbClient, logger }: TriggerInput) => {
  const orderId = medicineOrderImage?.id?.S;
  const orderNumber = medicineOrderImage?.orderNumber?.S;
  const pharmacyId = medicineOrderImage?.businessId?.S;
  const patientId = medicineOrderImage?.patientId?.S;
  const prescriptionId = medicineOrderImage?.prescriptionId?.S;

  if (!orderId || !orderNumber || !pharmacyId || !patientId) {
    logger.warn("Missing required order fields");
    return;
  }

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    logger.error("Failed to fetch pharmacy", { errors: pharmacyErrors });
    return;
  }
  const pharmacy = pharmacyData as unknown as Professional

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
  }
  const patient = patientData as unknown as Patient

  const { data: pharmacyAddressData, errors: pharmacyAddressErrors } = await dbClient.models.address.get({ addressOwnerId: pharmacyId });

  if (pharmacyAddressErrors || !pharmacyAddressData) {
    logger.error("Failed to fetch pharmacy address", { errors: pharmacyAddressErrors });
    return;
  }
  const pharmacyAddress = pharmacyAddressData as unknown as Address;

  const { data: deliveryData, errors: deliveryErrors } = await dbClient.models.delivery.get({ orderId });

  if (deliveryErrors || !deliveryData) {
    logger.error("Failed to fetch delivery", { errors: deliveryErrors });
    return;
  }
  const delivery = deliveryData as unknown as Delivery;
  let driver: Professional | null = null;
  let vehicle: Vehicle | null = null;
  const deliveryDeepLink = `curati://life.curati.www/(app)/profile/deliveries/${delivery.orderId}`;

  if (delivery.type === DeliveryType.DELIVERY && pharmacyAddress.latitude && pharmacyAddress.longitude) {
    const picked = await pickBestDriver({
      client: dbClient,
      logger: logger,
      pharmacyLocation: {
        lat: pharmacyAddress.latitude,
        lng: pharmacyAddress.longitude
      }
    })

    if (picked) {
      driver = picked.driver;
      vehicle = picked.vehicle;

      await newDeliveryAssignmentDriverEmailNotifier({
        toAddresses: [driver.email],
        deliveryNumber: orderNumber,
        driverName: driver.name,
        deliveryDeepLink: deliveryDeepLink
      })

      await newDeliveryAssignmentDriverSMSNotifier({
        phoneNumber: patient.phone,
        deliveryNumber: orderNumber,
        deliveryDeepLink: deliveryDeepLink
      })
    }
  }

  const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
    orderId,
    driverId: driver?.userId,
    vehicleId: vehicle?.id,
    courierId: driver?.businessId,
    status: DeliveryStatus.DRIVER_ASSIGNED
  })

  if (deliveryUpdateErrors) {
    logger.error("Failed to update delivery", { errors: deliveryUpdateErrors });
    return;
  }

  if (prescriptionId) {
    await updatePrescriptionRefillsRemaining({
      client: dbClient,
      logger,
      prescriptionId: prescriptionId
    })
  }

  if (patient.email) {
    await newDeliveryAssignmentPatientEmailNotifier({
      patientEmail: patient.email,
      pharmacyAddress: pharmacyAddress,
      pharmacyName: pharmacy.name,
      deliveryType: delivery.type,
      orderNumber: orderNumber,
      patientName: patient.name,
      deliveryDeepLink: deliveryDeepLink
    })
  }

  if (patient.phone) {
    await newDeliveryAssignmentPatientSMSNotifier({
      phoneNumber: patient.phone,
      pharmacyName: pharmacy.name,
      deliveryType: delivery.type,
      orderNumber: orderNumber,
    })
  }
};