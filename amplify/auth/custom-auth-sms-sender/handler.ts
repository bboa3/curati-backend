import { env } from '$amplify/env/custom-auth-sms-sender';
import { KMSClient } from "@aws-sdk/client-kms";
import { CustomSMSSenderTriggerHandler } from 'aws-lambda';
import { SendSMSService } from '../../functions/helpers/sendSms';

const kmsClient = new KMSClient({ region: env.AWS_REGION });

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

export const handler: CustomSMSSenderTriggerHandler = async (event) => {
  console.log('Received event:', JSON.stringify(event));

  const phoneNumber = event.request.userAttributes.phone_number;
  const encryptedCode = event.request.code;
  const userPoolId = event.userPoolId;

  if (!phoneNumber || !encryptedCode || !userPoolId) {
    throw new Error('Phone number or encrypted code or userPoolId not found.');
  }

  // console.log('Phone number:', phoneNumber);
  // console.log('Encrypted code:', encryptedCode);
  // console.log('userPoolId:', userPoolId);

  // const decryptCommand = new DecryptCommand({
  //   CiphertextBlob: Buffer.from(encryptedCode, 'base64'),
  //   EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
  //   EncryptionContext: { UserPoolId: userPoolId }
  // });

  // const { Plaintext } = await kmsClient.send(decryptCommand);
  // if (!Plaintext) {
  //   throw new Error('Failed to decrypt verification code.');
  // }

  // const code = Buffer.from(Plaintext).toString('utf-8');

  const message = `Your verification code is: Code __ ${encryptedCode}`;

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








