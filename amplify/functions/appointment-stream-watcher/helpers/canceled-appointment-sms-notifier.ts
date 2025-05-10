import { env } from '$amplify/env/appointment-stream-watcher';
import { formatDateTimeNumeric } from "../../helpers/date/formatter";
import { SendSMSService } from "../../helpers/sendSms";
import { AppointmentParticipantType, AppointmentStatus } from "../../helpers/types/schema";
import { convertAppointmentStatus } from "./appointment-status";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

interface SendInput {
  recipientPhoneNumber: string;
  otherPartyName: string;
  recipientType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string | Date;
  appointmentDeepLink: string;
  finalStatus: AppointmentStatus;
}

export async function canceledAppointmentSMSNotifier({
  recipientPhoneNumber,
  otherPartyName,
  recipientType,
  appointmentNumber,
  appointmentDateTime,
  appointmentDeepLink,
  finalStatus
}: SendInput) {
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedStatus = convertAppointmentStatus(finalStatus);
  const isRecipientPatient = recipientType === AppointmentParticipantType.PATIENT;
  const otherPartyText = isRecipientPatient ? `com ${otherPartyName}` : `com Pct ${otherPartyName}`;

  const message = `Curati: Agendamento ${appointmentNumber} ${otherPartyText} p/ ${formattedDateTime} foi ${formattedStatus}. ${isRecipientPatient ? 'Pode tentar reagendar na app ou contactar suporte.' : 'Horário libertado.'} App: ${appointmentDeepLink}`;

  return await smsService.sendSms({
    to: recipientPhoneNumber,
    message: message,
  });
}