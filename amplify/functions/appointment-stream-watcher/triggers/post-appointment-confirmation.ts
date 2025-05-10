import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, AppointmentParticipantType, AppointmentStatus, Patient, Professional } from '../../helpers/types/schema';
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

export const postAppointmentConfirmation = async ({ appointmentImage, oldImageStatus, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { id: appointmentId, appointmentNumber, appointmentDateTime, duration, type: appointmentType, purpose, patientId, professionalId } = appointment;

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
    })
  }))

  if (oldImageStatus === AppointmentStatus.RESCHEDULED) {
    await deleteReminders({
      dbClient,
      appointmentId,
      recipients: recipients.map(({ userId }) => ({ userId }))
    })
  }

  await createReminders({
    dbClient,
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
};