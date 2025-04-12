import { AttributeValue } from "aws-lambda";
import { AppointmentStatus, Patient } from '../../helpers/types/schema';

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
}

export const postAppointmentRescheduled = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointmentNumber = appointmentImage?.appointmentNumber?.S;
  const appointmentId = appointmentImage?.id?.S;
  const appointmentStatus = appointmentImage?.status?.S as AppointmentStatus;
  const patientId = appointmentImage?.patientId?.S;

  if (!appointmentNumber || !appointmentId || !appointmentStatus || !patientId) {
    throw new Error("Missing required appointment fields");
  }

  const { data: patient, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patient) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }

  const { name, email, phone } = patient as unknown as Patient;
  const appointmentDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;
};