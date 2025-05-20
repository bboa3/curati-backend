import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, Patient, Professional } from '../../helpers/types/schema';
import { createAppointmentStartedNotification } from "../helpers/create-appointment-started-notification";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentStarted = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { patientId, professionalId } = appointment;

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

  await createAppointmentStartedNotification({
    dbClient,
    professional,
    patient,
    appointment,
  });
};