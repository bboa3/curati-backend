import { Logger } from "@aws-lambda-powertools/logger";
import { AttributeValue } from "aws-lambda";
import { AppointmentParticipantType, AppointmentType, Patient, Professional } from '../../helpers/types/schema';
import { sendAppointmentConfirmationRequestEmail } from "../helpers/send-appointment-confirmation-request-email";
import { sendAppointmentConfirmationRequestSMS } from "../helpers/send-appointment-confirmation-request-sms";

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentReadyForConfirmation = async ({ appointmentImage, dbClient, logger }: TriggerInput) => {
  const appointmentNumber = appointmentImage?.appointmentNumber?.S;
  const appointmentId = appointmentImage?.id?.S;
  const patientId = appointmentImage?.patientId?.S;
  const professionalId = appointmentImage?.professionalId?.S;
  const appointmentType = appointmentImage?.appointmentType?.S as AppointmentType;
  const requesterType = appointmentImage?.requesterType?.S as AppointmentParticipantType;
  const appointmentDateTime = appointmentImage?.appointmentDateTime?.S;
  const duration = appointmentImage?.duration?.N;
  const purpose = appointmentImage?.purpose?.S;

  if (!appointmentNumber || !purpose || !appointmentId || !duration || !patientId || !professionalId || !requesterType || !appointmentType || !appointmentDateTime) {
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

  const requester = requesterType === AppointmentParticipantType.PATIENT ? patient : professional;
  const recipient = requesterType === AppointmentParticipantType.PATIENT ? professional : patient;

  if (recipient.email) {
    await sendAppointmentConfirmationRequestEmail({
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      requesterName: requester.name,
      requesterType,
      appointmentNumber,
      appointmentDateTime,
      duration: Number(duration),
      appointmentType,
      purpose,
      appointmentDeepLink,
    })
  }

  await sendAppointmentConfirmationRequestSMS({
    recipientPhoneNumber: `+258${recipient.phone.replace(/\D/g, '')}`,
    requesterName: recipient.name,
    requesterType,
    appointmentNumber,
    appointmentDateTime,
    appointmentDeepLink,
  })
};