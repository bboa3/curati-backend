import { env } from '$amplify/env/appointment-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";
import { AppointmentType } from "../../helpers/types/schema";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


interface SendInput {
  recipientPhoneNumber: string;
  starterName: string;
  appointmentNumber: string;
  appointmentType: AppointmentType;
  appointmentJoinLink: string;
}

export async function startedAppointmentSMSNotifier({
  recipientPhoneNumber,
  starterName,
  appointmentNumber,
  appointmentType,
  appointmentJoinLink,
}: SendInput) {
  let message: string;

  if (appointmentType === AppointmentType.IN_PERSON) {
    message = `Curati: ${starterName} iniciou a consulta presencial (${appointmentNumber}). Por favor, dirija-se ao local combinado.`;
  } else {
    message = `Curati: ${starterName} iniciou a sessão (${appointmentNumber}). Entre agora pela app: ${appointmentJoinLink}`;
  }

  return await smsService.sendSms({
    to: recipientPhoneNumber,
    message: message,
  });
}