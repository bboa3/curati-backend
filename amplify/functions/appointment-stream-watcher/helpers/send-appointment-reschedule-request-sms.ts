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
  requesterName: string;
  requesterType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string | Date;
  appointmentDeepLink: string;
}

export async function sendAppointmentRescheduleRequestSMS({
  recipientPhoneNumber,
  requesterName,
  requesterType,
  appointmentNumber,
  appointmentDateTime,
  appointmentDeepLink,
}: SendInput) {
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const requesterTypeText = requesterType === AppointmentParticipantType.PATIENT ? 'Paciente' : 'Profissional';

  const message = `Curati: ${requesterTypeText} ${requesterName} agendou consulta (${appointmentNumber}) p/ ${formattedDateTime}. Confirmação necessária. Confirme na app: ${appointmentDeepLink}`;

  return await smsService.sendSms({
    to: recipientPhoneNumber,
    message: message,
  });
}