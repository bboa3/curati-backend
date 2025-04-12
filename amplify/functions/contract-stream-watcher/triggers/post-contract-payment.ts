import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Appointment, AppointmentStatus, Contract } from '../../helpers/types/schema';

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractPayment = async ({ contractImage, dbClient }: TriggerInput) => {
  const contract = unmarshall(contractImage) as Contract;
  const { id: contractId } = contract;

  const { data: appointmentsData, errors: appointmentErrors } = await dbClient.models.appointment.list({
    filter: {
      contractId: { eq: contractId },
      status: { eq: AppointmentStatus.PENDING_PAYMENT }
    }
  });

  if (appointmentErrors || !appointmentsData) {
    throw new Error(`Failed to fetch appointments: ${JSON.stringify(appointmentErrors)}`);
  }
  const appointments = appointmentsData as Appointment[]

  await Promise.all(appointments.map(async (appointment) => {
    if (appointment.status === AppointmentStatus.PENDING_PAYMENT) {
      await dbClient.models.appointment.update({
        id: appointment.id,
        status: AppointmentStatus.PENDING_CONFIRMATION
      })
    }
  }));
};