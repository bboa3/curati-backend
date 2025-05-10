import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  deliveryTrackingDeepLink: string;
}

export async function sendDriverAssignedPatientSMSNotifier({ phoneNumber, deliveryNumber, deliveryTrackingDeepLink }: NotifierInput) {
  const message = `Curati: Sua entrega #${deliveryNumber} já tem motorista! Ele(a) está a ir p/ farmácia. Acompanhe ao vivo aqui: ${deliveryTrackingDeepLink}`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

