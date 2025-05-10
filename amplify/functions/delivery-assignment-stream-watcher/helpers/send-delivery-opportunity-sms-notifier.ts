import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  deliveryOpportunityDeepLink: string;
}

export async function sendDeliveryOpportunitySMSNotifier({ phoneNumber, deliveryNumber, deliveryOpportunityDeepLink }: NotifierInput) {
  const message = `Curati Go: Oportunidade de entrega #${deliveryNumber}! Urgente: Seja o primeiro a aceitar na app! Vaga expira breve -> ${deliveryOpportunityDeepLink}`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

