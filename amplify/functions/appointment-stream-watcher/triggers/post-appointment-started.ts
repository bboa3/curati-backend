import { Logger } from "@aws-lambda-powertools/logger";
import { AttributeValue } from "aws-lambda";
import dayjs from "dayjs";
import { AppointmentParticipantType, AppointmentType, Outcome, Patient, Professional } from '../../helpers/types/schema';
import { startedAppointmentEmailNotifier } from "../helpers/started-appointment-email-notifier";
import { startedAppointmentSMSNotifier } from "../helpers/started-appointment-sms-notifier";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentStarted = async ({ appointmentImage, dbClient, logger }: TriggerInput) => {
  const appointmentNumber = appointmentImage?.appointmentNumber?.S;
  const appointmentId = appointmentImage?.id?.S;
  const patientId = appointmentImage?.patientId?.S;
  const contractId = appointmentImage?.contractId?.S;
  const businessServiceId = appointmentImage?.businessServiceId?.S;
  const professionalId = appointmentImage?.professionalId?.S;
  const appointmentType = appointmentImage?.appointmentType?.S as AppointmentType;
  const starterType = appointmentImage?.starterType?.S as AppointmentParticipantType;
  const purpose = appointmentImage?.purpose?.S;

  if (!appointmentNumber || !appointmentId || !contractId || !patientId || !professionalId || !businessServiceId || !appointmentType || !purpose) {
    logger.warn("Missing required appointment fields");
    return;
  }

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
  }
  const patient = patientData as unknown as Patient;

  const { data: professionalData, errors: professionalErrors } = await dbClient.models.professional.get({ userId: professionalId });

  if (professionalErrors || !professionalData) {
    logger.error("Failed to fetch patient", { errors: professionalErrors });
    return;
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
    logger.error('Failed to create consultation record', { errors: consultationRecordErrors });
    return;
  }
};