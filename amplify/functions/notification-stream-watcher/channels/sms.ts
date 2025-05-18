import { env } from '$amplify/env/notification-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";
import { SmsMessage } from "../helpers/types";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

interface SenderInput {
  message: SmsMessage
}

export const sendSms = async ({ message }: SenderInput) => {
  const { phoneNumbers, body } = message;

  await Promise.all(phoneNumbers.map(async (phoneNumber: string) => {
    return await smsService.sendSms({
      to: phoneNumber,
      message: body,
    });
  }));
}