import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, AppointmentStatus, Patient, Professional } from '../../helpers/types/schema';
import { createAppointmentConfirmationRequestNotification } from "../helpers/create -appointment-confirmation-request-notification";
import { createAppointmentRescheduleConfirmationRequestNotification } from "../helpers/create -appointment-reschedule-confirmation-request-notification";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  originalAppointmentDateTime?: string
  dbClient: any;
  logger: Logger;
}

export const postAppointmentReadyForConfirmation = async ({ appointmentImage, originalAppointmentDateTime, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { patientId, professionalId, status } = appointment;

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient;

  const { data: professionalData, errors: professionalErrors } = await dbClient.models.professional.get({ userId: professionalId });

  if (professionalErrors || !professionalData) {
    throw new Error(`Failed to fetch professional: ${JSON.stringify(professionalErrors)}`);
  }
  const professional = professionalData as unknown as Professional;

  if (originalAppointmentDateTime && status === AppointmentStatus.RESCHEDULED) {
    await createAppointmentRescheduleConfirmationRequestNotification({
      dbClient,
      professional,
      patient,
      appointment,
      originalAppointmentDateTime
    });
  } else {
    await createAppointmentConfirmationRequestNotification({
      dbClient,
      professional,
      patient,
      appointment
    });
  }
};