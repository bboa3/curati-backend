import { Logger } from "@aws-lambda-powertools/logger";
import { AttributeValue } from "aws-lambda";
import { AppointmentStatus, Patient } from '../../helpers/types/schema';

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentStarted = async ({ appointmentImage, dbClient, logger }: TriggerInput) => {
  const appointmentNumber = appointmentImage?.appointmentNumber?.S;
  const appointmentId = appointmentImage?.id?.S;
  const appointmentStatus = appointmentImage?.status?.S as AppointmentStatus;
  const patientId = appointmentImage?.patientId?.S;

  if (!appointmentNumber || !appointmentId || !appointmentStatus || !patientId) {
    logger.warn("Missing required appointment fields");
    return;
  }

  const { data: patient, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patient) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
  }

  const { name, email, phone } = patient as unknown as Patient;
  const appointmentDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;

};