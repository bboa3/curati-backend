import { env } from '$amplify/env/custom-auth-sms-sender';
import { DecryptCommand, KMSClient } from "@aws-sdk/client-kms";
import { Buffer } from 'buffer';
import { SendSMSService } from '../helpers/sendSms';

const kmsClient = new KMSClient({ region: env.AWS_REGION });

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
  const phoneNumber = event.request.userAttributes.phone_number;
  const encryptedCode = event.request.code;

  if (!phoneNumber || !encryptedCode) {
    throw new Error('Phone number or encrypted code not found.');
  }

  console.log('Phone number:', phoneNumber);
  console.log('Encrypted code:', encryptedCode);

  const decryptCommand = new DecryptCommand({
    CiphertextBlob: Buffer.from(encryptedCode, 'base64')
  });

  const { Plaintext } = await kmsClient.send(decryptCommand);
  if (!Plaintext) {
    throw new Error('Failed to decrypt verification code.');
  }

  const code = Buffer.from(Plaintext).toString('utf-8');

  const message = `Your verification code is: ${code} __ ${encryptedCode}`;

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