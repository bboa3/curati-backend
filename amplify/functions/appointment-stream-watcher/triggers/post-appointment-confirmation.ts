import { Logger } from "@aws-lambda-powertools/logger";
import { AttributeValue } from "aws-lambda";
import { AppointmentParticipantType, AppointmentStatus, AppointmentType, Patient, Professional } from '../../helpers/types/schema';
import { confirmedAppointmentEmailNotifier } from "../helpers/confirmed-appointment-email-notifier";
import { confirmedAppointmentSMSNotifier } from "../helpers/confirmed-appointment-sms-notifier";
import { createReminders } from "../helpers/create-reminders";
import { deleteReminders } from "../helpers/delete-reminders";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  oldImageStatus: AppointmentStatus;
  dbClient: any;
  logger: Logger;
}

export const postAppointmentConfirmation = async ({ appointmentImage, oldImageStatus, dbClient, logger }: TriggerInput) => {
  const appointmentNumber = appointmentImage?.appointmentNumber?.S;
  const appointmentId = appointmentImage?.id?.S;
  const patientId = appointmentImage?.patientId?.S;
  const professionalId = appointmentImage?.professionalId?.S;
  const appointmentType = appointmentImage?.appointmentType?.S as AppointmentType;
  const appointmentStatus = appointmentImage?.status?.S as AppointmentStatus;
  const appointmentDateTime = appointmentImage?.appointmentDateTime?.S;
  const cancellationReason = appointmentImage?.cancellationReason?.S;
  const duration = appointmentImage?.duration?.N;
  const purpose = appointmentImage?.purpose?.S;

  if (!appointmentNumber || !purpose || !appointmentId || !appointmentStatus || !duration || !patientId || !professionalId || !appointmentType || !appointmentDateTime) {
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

  const appointmentDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;

  const recipients = [
    {
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      type: AppointmentParticipantType.PATIENT,
      otherPartyName: professional.name
    },
    {
      userId: professional.userId,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      type: AppointmentParticipantType.PROFESSIONAL,
      otherPartyName: patient.name
    }
  ]

  await Promise.all(recipients.map(async recipient => {
    if (recipient.email) {
      await confirmedAppointmentEmailNotifier({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientType: recipient.type,
        otherPartyName: recipient.otherPartyName,
        appointmentNumber,
        appointmentDateTime,
        duration: Number(duration),
        appointmentType,
        purpose,
        finalStatus: appointmentStatus,
        cancellationReason,
        appointmentDeepLink,
      })
    }
  }))

  await Promise.all(recipients.map(async recipient => {
    await confirmedAppointmentSMSNotifier({
      recipientPhoneNumber: `+258${recipient.phone.replace(/\D/g, '')}`,
      otherPartyName: recipient.otherPartyName,
      recipientType: recipient.type,
      appointmentNumber,
      appointmentDateTime,
      appointmentDeepLink,
      finalStatus: appointmentStatus
    })
  }))

  if (oldImageStatus === AppointmentStatus.RESCHEDULED) {
    await deleteReminders({
      dbClient,
      logger,
      appointmentId,
      recipients: recipients.map(({ userId }) => ({ userId }))
    })
  }

  if (appointmentStatus === AppointmentStatus.CONFIRMED) {
    await createReminders({
      dbClient,
      logger,
      appointmentDateTime,
      purpose,
      professionalType: professional.type,
      appointmentType,
      appointmentId,
      recipients: recipients.map(recipient => ({
        userId: recipient.userId,
        type: recipient.type,
        otherPartyName: recipient.otherPartyName
      }))
    })
  } else {
    await deleteReminders({
      dbClient,
      logger,
      appointmentId,
      recipients: recipients.map(({ userId }) => ({ userId }))
    })
  }
};