import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  pharmacyName: string;
  pharmacyAddressSnippet: string;
  assignedDeliveryDeepLink: string;
}


export async function sendDeliveryAssignmentConfirmationSMSNotifier({ phoneNumber, deliveryNumber, pharmacyName, pharmacyAddressSnippet, assignedDeliveryDeepLink }: NotifierInput) {
  const message = `Curati Go: Você conseguiu! Entrega #${deliveryNumber}. Inicie agora: vá à farmácia ${pharmacyName} (${pharmacyAddressSnippet}). App p/ rota: ${assignedDeliveryDeepLink}`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

