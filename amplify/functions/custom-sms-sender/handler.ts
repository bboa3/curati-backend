import { env } from '$amplify/env/custom-sms-sender';
import { SendSMSService } from '../helpers/sendSms';

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

interface CustomSMSSenderEvent {
  version: string;
  triggerSource: string;
  region: string;
  userPoolId: string;
  userName: string;
  callerContext: {
    awsSdkVersion: string;
    clientId: string;
  };
  request: {
    type: 'customSMSSender';
    code: string;
    userAttributes: {
      phone_number?: string;
      // other attributes
    };
  };
  response: Record<string, unknown>;
}

export const handler = async (event: CustomSMSSenderEvent) => {
  console.log('CustomSMSSender event received:', JSON.stringify(event, null, 2));

  const phoneNumber = event.userName;
  const code = event.request.code;

  if (!phoneNumber) {
    console.error('Phone number not found in event.userName');
    throw new Error('Phone number not available in event.userName.');
  }

  if (!code) {
    console.error('Code not found in event.request.code');
    throw new Error('Verification code not available in event.request.code.');
  }

  const message = `Your verification code is: ${code}`;

  try {
    await smsService.sendSms({
      to: phoneNumber,
      message: message,
    })
  } catch (error) {
    console.error('Error sending SMS via external API:', error);
    throw error;
  }

  return event;
}