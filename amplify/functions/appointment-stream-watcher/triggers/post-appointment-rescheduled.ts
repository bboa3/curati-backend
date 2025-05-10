import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, Patient } from '../../helpers/types/schema';

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
}

export const postAppointmentRescheduled = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { id: appointmentId, appointmentNumber, status: appointmentStatus, patientId } = appointment;

  const { data: patient, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patient) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }

  const { name, email, phone } = patient as unknown as Patient;
  const appointmentDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;
};