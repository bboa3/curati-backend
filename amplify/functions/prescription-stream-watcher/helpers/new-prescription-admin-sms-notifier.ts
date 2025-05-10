import { env } from '$amplify/env/prescription-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


export async function newPrescriptionAdminSMSNotifier(phoneNumber: string, prescriptionNumber: string) {
  const message = `Validação de Nova Receita Necessária\n\nUma nova prescrição foi submetida e aguarda a sua validação no sistema Cúrati.\n\nNúmero da Receita: ${prescriptionNumber}\n\nAção Necessária: Por favor, acesse a plataforma para revisar e validar a prescrição o mais breve possível.`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

