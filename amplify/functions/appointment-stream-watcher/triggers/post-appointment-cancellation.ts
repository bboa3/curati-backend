import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, Contract, Patient, Professional } from '../../helpers/types/schema';
import { createAppointmentCancellationNotification } from "../helpers/create-appointment-cancellation-notification";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentCancellation = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { contractId, patientId, professionalId } = appointment;

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

  const { data: contractData, errors: contractErrors } = await dbClient.models.contract.get({ id: contractId });

  if (contractErrors || !contractData) {
    throw new Error(`Failed to fetch contract: ${JSON.stringify(contractErrors)}`);
  }
  const contract = contractData as unknown as Contract;

  await createAppointmentCancellationNotification({
    dbClient,
    professional,
    patient,
    appointment
  })

  const { errors: contractUpdateErrors } = await dbClient.models.contract.update({
    id: contractId,
    appointmentsUsed: contract.appointmentsUsed - 1
  })

  if (contractUpdateErrors) {
    throw new Error(`Failed to update contract: ${JSON.stringify(contractUpdateErrors)}`);
  }
};