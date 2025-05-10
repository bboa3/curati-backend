import { env } from '$amplify/env/custom-auth-sms-sender';
import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';
import { CustomSMSSenderTriggerHandler } from 'aws-lambda';
import { SendSMSService } from '../../functions/helpers/sendSms';
import { createAuthEventMessage } from './helpers/createAuthMessage';

const { decrypt } = buildClient(CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT);

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

export const handler: CustomSMSSenderTriggerHandler = async (event) => {
  console.log('Processing authentication event:', event.triggerSource);

  const phoneNumber = event.request.userAttributes.phone_number;
  const encryptedCode = event.request.code;
  const userPoolId = event.userPoolId;

  if (!phoneNumber || !encryptedCode || !userPoolId) {
    console.error('Missing required parameters:', {
      hasPhoneNumber: !!phoneNumber,
      hasEncryptedCode: !!encryptedCode,
      hasUserPoolId: !!userPoolId
    });
    throw new Error('Phone number or encrypted code or userPoolId not found.');
  }

  let code;

  const digitMatch = encryptedCode.match(/\d{6}/);
  if (digitMatch) {
    code = digitMatch[0];
    console.log('Found 6-digit code using pattern matching');
  } else {
    console.log('No 6-digit code found in string, attempting decryption');

    try {
      const discoveryKeyring = new KmsKeyringNode({ discovery: true });
      const { plaintext } = await decrypt(discoveryKeyring, Buffer.from(encryptedCode, 'base64'));
      code = plaintext.toString('utf8');
      console.log('Successfully decrypted code using discovery keyring');
    } catch (error) {
      console.log('Discovery keyring decryption failed, trying specific key');

      try {
        const keyring = new KmsKeyringNode({
          generatorKeyId: `alias/aws/cognito-idp-${userPoolId}`
        });

        const { plaintext } = await decrypt(keyring, Buffer.from(encryptedCode, 'base64'));
        code = plaintext.toString('utf8');
        console.log('Successfully decrypted code using specific key');
      } catch (secondError) {
        console.error('All decryption methods failed:', secondError);
        throw new Error('Failed to decrypt verification code');
      }
    }
  }

  const message = createAuthEventMessage({
    plainTextCode: code,
    eventType: event.triggerSource,
  });

  try {
    await smsService.sendSms({
      to: phoneNumber,
      message: message,
    });
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Error sending SMS via external API:', error);
    throw error;
  }

  return event;
}