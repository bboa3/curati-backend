import { env } from '$amplify/env/appointment-stream-watcher';
import { formatDateTimeNumeric } from "../../helpers/date/formatter";
import { SendSMSService } from "../../helpers/sendSms";
import { AppointmentParticipantType } from "../../helpers/types/schema";

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
}

export async function confirmedAppointmentSMSNotifier({
  recipientPhoneNumber,
  otherPartyName,
  recipientType,
  appointmentNumber,
  appointmentDateTime,
  appointmentDeepLink
}: SendInput) {

  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const isRecipientPatient = recipientType === AppointmentParticipantType.PATIENT;
  const otherPartyText = isRecipientPatient ? `com ${otherPartyName}` : `com Pct ${otherPartyName}`;

  const message = `Curati: Agendamento ${appointmentNumber} ${otherPartyText} p/ ${formattedDateTime} CONFIRMADO. Detalhes na app: ${appointmentDeepLink}`;

  return await smsService.sendSms({
    to: recipientPhoneNumber,
    message: message,
  });
}