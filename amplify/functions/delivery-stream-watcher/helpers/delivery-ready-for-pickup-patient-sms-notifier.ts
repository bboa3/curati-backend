import { env } from '$amplify/env/delivery-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

interface NotifierInput {
  phoneNumber: string;
  pharmacyName: string;
  orderNumber: string;
}

export async function deliveryReadyForPickupPatientSMSNotifier({ phoneNumber, pharmacyName, orderNumber }: NotifierInput) {
  const message = `Curati: Óptima notícia! Sua encomenda (${orderNumber}) está PRONTA p/ retirada na Farmácia ${pharmacyName}. Verifique email/app Cúrati p/ detalhes e horário.`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

