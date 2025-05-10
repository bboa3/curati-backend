import { env } from '$amplify/env/contract-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

interface NotifierInput {
  phoneNumber: string;
  contractNumber: string;
  patientName: string;
  contractDeepLink: string;
}

export async function newContractProfessionalSMSNotifier({ phoneNumber, contractNumber, patientName, contractDeepLink }: NotifierInput) {
  const message = `Curati Pro: Confirmação necessária p/ novo contrato (${contractNumber}). Paciente: ${patientName}. Reveja e confirme na app: ${contractDeepLink}`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

