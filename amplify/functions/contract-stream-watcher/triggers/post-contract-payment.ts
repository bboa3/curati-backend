import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Appointment, AppointmentStatus } from '../../helpers/types/schema';

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractPayment = async ({ contractImage, dbClient, logger }: TriggerInput) => {
  const contractId = contractImage?.id?.S;

  if (!contractId) {
    logger.warn("Missing required contract fields");
    return;
  }

  const { data: appointmentsData, errors: appointmentErrors } = await dbClient.models.appointment.list({
    filter: {
      contractId: { eq: contractId },
      status: { eq: AppointmentStatus.PENDING_PAYMENT }
    }
  });

  if (appointmentErrors || !appointmentsData) {
    logger.error("Failed to fetch appointments", appointmentErrors);
    return;
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