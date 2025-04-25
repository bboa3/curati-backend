import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { Appointment, AppointmentStatus } from '../../../functions/helpers/types/schema';

interface TriggerInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
  logger: Logger;
}

export const fetchCompletedAppointments = async ({
  businessId,
  periodStart,
  periodEnd,
  dbClient,
  logger
}: TriggerInput) => {
  const { data, errors } = await dbClient.models.appointment.list({
    filter: {
      businessId: { eq: businessId },
      status: { eq: AppointmentStatus.COMPLETED },
      appointmentDateTime: { between: [periodStart.toISOString(), periodEnd.toISOString()] }
    }
  });

  if (errors) throw new Error(`Failed to fetch appointments: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} appointments`);
  return data as Appointment[];
};