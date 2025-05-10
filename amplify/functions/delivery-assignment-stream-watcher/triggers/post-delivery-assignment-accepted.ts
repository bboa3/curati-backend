import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { createDeliveryStatusHistory } from "../../helpers/create-delivery-status-history";
import { Business, Delivery, DeliveryAssignment, DeliveryStatus, Professional, Vehicle } from "../../helpers/types/schema";
import { sendDeliveryAssignmentConfirmationEmailNotifier } from "../helpers/send-delivery-assignment-confirmation-email-notifier";
import { sendDeliveryAssignmentConfirmationSMSNotifier } from "../helpers/send-delivery-assignment-confirmation-sms-notifier";
import { sendDriverAssignedPatientEmailNotifier } from "../helpers/send-driver-assigned-patient-email-notifier";
import { sendDriverAssignedPatientSMSNotifier } from "../helpers/send-driver-assigned-patient-sms-notifier";

interface TriggerInput {
  deliveryAssignmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postDeliveryAssignmentAccepted = async ({ deliveryAssignmentImage, dbClient }: TriggerInput) => {
  const deliveryAssignment = unmarshall(deliveryAssignmentImage as any) as DeliveryAssignment;
  const { id, deliveryId } = deliveryAssignment;

  const { data: deliveryAssignmentsData, errors: assignmentsErrors } = await dbClient.models.deliveryAssignment.list({
    filter: { deliveryId: { eq: deliveryId } }
  });

  if (assignmentsErrors) {
    throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(assignmentsErrors)}`);
  }
  const deliveryAssignments = deliveryAssignmentsData as DeliveryAssignment[];
  const assignment = deliveryAssignments.find((assignment) => assignment.id === id);

  if (assignment) {
    const { driverId, deliveryId, pickupSnippet, courierId } = assignment;
    const { data: deliveryData, errors: deliveryErrors } = await dbClient.models.delivery.get({ orderId: deliveryId });

    if (deliveryErrors || !deliveryData) {
      throw new Error(`Failed to fetch delivery: ${JSON.stringify(deliveryErrors)}`);
    }
    const delivery = deliveryData as unknown as Delivery;

    const { data: vehiclesData, errors: vehiclesErrors } = await dbClient.models.vehicle.list({ filter: { driverId: { eq: driverId }, } })

    if (vehiclesErrors || vehiclesData.length === 0) {
      throw new Error(`Failed to fetch vehicles: ${JSON.stringify(vehiclesErrors)}`);
    }
    const vehicle = vehiclesData[0] as unknown as Vehicle;

    const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: delivery.pharmacyId });

    if (pharmacyErrors || !pharmacyData) {
      throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(pharmacyErrors)}`);
    }
    const pharmacy = pharmacyData as unknown as Business;

    const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: delivery.patientId });

    if (patientErrors || !patientData) {
      throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
    }
    const patient = patientData as unknown as Professional;

    const { data: driverData, errors: driverErrors } = await dbClient.models.professional.get({ userId: driverId });

    if (driverErrors || !driverData) {
      throw new Error(`Failed to fetch pharmacy address: ${JSON.stringify(driverErrors)}`);
    }

    const driver = driverData as unknown as Professional;

    const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
      orderId: deliveryId,
      driverId: driverId,
      vehicleId: vehicle.id,
      courierId: courierId,
      status: DeliveryStatus.DRIVER_ASSIGNED
    })

    if (deliveryUpdateErrors) {
      throw new Error(`Failed to update delivery: ${JSON.stringify(deliveryUpdateErrors)}`);
    }

    await createDeliveryStatusHistory({
      client: dbClient,
      patientId: delivery.patientId,
      deliveryId: delivery.orderId,
      status: DeliveryStatus.DRIVER_ASSIGNED,
      latitude: pharmacy.businessLatitude,
      longitude: pharmacy.businessLongitude
    })

    for (const deliveryAssignment of deliveryAssignments) {
      const { errors: deliveryAssignmentDeleteErrors } = await dbClient.models.deliveryAssignment.delete({ id: deliveryAssignment.id });

      if (deliveryAssignmentDeleteErrors) {
        throw new Error(`Failed to delete delivery assignment: ${JSON.stringify(deliveryAssignmentDeleteErrors)}`);
      }
    }

    const assignedDeliveryDeepLink = `curati://life.curati.go/(app)/(tabs)/`;
    const deliveryTrackingDeepLink = `curati://life.curati.www/(app)/profile/deliveries/${deliveryId}`;

    await sendDeliveryAssignmentConfirmationEmailNotifier({
      toAddresses: [driver.email],
      driverName: driver.name,
      deliveryNumber: delivery.deliveryNumber,
      pharmacyName: pharmacy.name,
      pharmacyAddressSnippet: pickupSnippet,
      preferredDeliveryTimeStartAt: delivery.preferredDeliveryTimeStartAt,
      preferredDeliveryTimeEndAt: delivery.preferredDeliveryTimeEndAt,
      assignedDeliveryDeepLink: assignedDeliveryDeepLink,
    })

    await sendDeliveryAssignmentConfirmationSMSNotifier({
      phoneNumber: `+258${driver.phone.replace(/\D/g, '')}`,
      deliveryNumber: delivery.deliveryNumber,
      pharmacyName: pharmacy.name,
      pharmacyAddressSnippet: pickupSnippet,
      assignedDeliveryDeepLink: assignedDeliveryDeepLink,
    })

    if (patient.email) {
      await sendDriverAssignedPatientEmailNotifier({
        toAddresses: [patient.email],
        patientName: patient.name,
        deliveryNumber: delivery.deliveryNumber,
        preferredDeliveryTimeStartAt: delivery.preferredDeliveryTimeStartAt,
        preferredDeliveryTimeEndAt: delivery.preferredDeliveryTimeEndAt,
        deliveryTrackingDeepLink: deliveryTrackingDeepLink
      })
    }

    await sendDriverAssignedPatientSMSNotifier({
      phoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
      deliveryNumber: delivery.deliveryNumber,
      deliveryTrackingDeepLink: deliveryTrackingDeepLink
    })

  }
};