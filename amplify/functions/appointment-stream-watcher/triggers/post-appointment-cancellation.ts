import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, AppointmentParticipantType, Contract, Patient, Professional } from '../../helpers/types/schema';
import { canceledAppointmentEmailNotifier } from "../helpers/canceled-appointment-email-notifier";
import { canceledAppointmentSMSNotifier } from "../helpers/canceled-appointment-sms-notifier";
import { deleteReminders } from "../helpers/delete-reminders";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentCancellation = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage) as Appointment;
  const { id: appointmentId, contractId, appointmentNumber, appointmentDateTime, purpose, status: appointmentStatus, cancellationReason, patientId, professionalId } = appointment;

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
      await canceledAppointmentEmailNotifier({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientType: recipient.type,
        otherPartyName: recipient.otherPartyName,
        appointmentNumber,
        appointmentDateTime,
        purpose,
        finalStatus: appointmentStatus,
        cancellationReason: cancellationReason || undefined,
        appointmentDeepLink,
      })
    }
  }))

  await Promise.all(recipients.map(async recipient => {
    await canceledAppointmentSMSNotifier({
      recipientPhoneNumber: `+258${recipient.phone.replace(/\D/g, '')}`,
      otherPartyName: recipient.otherPartyName,
      recipientType: recipient.type,
      appointmentNumber,
      appointmentDateTime,
      appointmentDeepLink,
      finalStatus: appointmentStatus
    })
  }))

  await deleteReminders({
    dbClient,
    appointmentId,
    recipients: recipients.map(({ userId }) => ({ userId }))
  })

  const { errors: contractUpdateErrors } = await dbClient.models.contract.update({
    id: contractId,
    appointmentsUsed: contract.appointmentsUsed - 1
  })

  if (contractUpdateErrors) {
    throw new Error(`Failed to update contract: ${JSON.stringify(contractUpdateErrors)}`);
  }
};