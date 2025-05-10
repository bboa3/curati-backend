import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import dayjs from "dayjs";
import { Appointment, AppointmentParticipantType, Outcome, Patient, Professional } from '../../helpers/types/schema';
import { startedAppointmentEmailNotifier } from "../helpers/started-appointment-email-notifier";
import { startedAppointmentSMSNotifier } from "../helpers/started-appointment-sms-notifier";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentStarted = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { id: appointmentId, appointmentNumber, contractId, patientId, professionalId, businessServiceId, type: appointmentType, purpose, starterType } = appointment;

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

  const appointmentJoinLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;

  const starter = starterType === AppointmentParticipantType.PATIENT ? patient : professional;
  const recipient = starterType === AppointmentParticipantType.PATIENT ? professional : patient;

  if (recipient.email) {
    await startedAppointmentEmailNotifier({
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      starterName: starter.name,
      starterType: starterType,
      appointmentNumber,
      appointmentType,
      purpose,
      appointmentJoinLink,
    });
  }

  await startedAppointmentSMSNotifier({
    recipientPhoneNumber: recipient.phone,
    starterName: starter.name,
    appointmentNumber,
    appointmentType,
    appointmentJoinLink,
  });

  const { errors: consultationRecordErrors } = await dbClient.models.consultationRecord.create({
    appointmentId,
    contractId,
    patientId,
    businessId: professional.businessId,
    professionalId,
    businessServiceId,
    type: appointmentType,
    purpose,
    notes: '',
    outcome: Outcome.NOT_COMPLETED,
    startedAt: dayjs().utc().toISOString(),
  })

  if (consultationRecordErrors) {
    throw new Error(`Failed to create consultation record: ${JSON.stringify(consultationRecordErrors)}`);
  }
};