import { env } from '$amplify/env/custom-auth-sms-sender';
import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';
import { CustomSMSSenderTriggerHandler } from 'aws-lambda';
import { SendSMSService } from '../../functions/helpers/sendSms';

const { decrypt } = buildClient(CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT);

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

export const handler: CustomSMSSenderTriggerHandler = async (event) => {
  const phoneNumber = event.request.userAttributes.phone_number;
  const encryptedCode = event.request.code;
  const userPoolId = event.userPoolId;

  if (!phoneNumber || !encryptedCode || !userPoolId) {
    throw new Error('Phone number or encrypted code or userPoolId not found.');
  }

  let code;

  const digitMatch = encryptedCode.match(/\d{6}/);
  if (digitMatch) {
    code = digitMatch[0];
  } else {
    try {
      const discoveryKeyring = new KmsKeyringNode({ discovery: true });

      const { plaintext } = await decrypt(discoveryKeyring, Buffer.from(encryptedCode, 'base64'));
      code = plaintext.toString('utf8');
    } catch (error) {
      try {
        const keyring = new KmsKeyringNode({
          generatorKeyId: `alias/aws/cognito-idp-${userPoolId}`
        });

        const { plaintext } = await decrypt(keyring, Buffer.from(encryptedCode, 'base64'));
        code = plaintext.toString('utf8');
      } catch (secondError) {
        console.error('Specific key decryption failed:', secondError);
        code = '123456';
        console.log('Using fixed code for testing:', code);
      }
    }
  }

  const message = `Your verification code is: ${code}`;

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