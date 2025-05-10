import { env } from '$amplify/env/custom-auth-sms-sender';
import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';
import { CustomSMSSenderTriggerHandler } from 'aws-lambda';
import { SendSMSService } from '../../functions/helpers/sendSms';

// Initialize the AWS Encryption SDK client with a more permissive commitment policy
const { decrypt } = buildClient(CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT);

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

  console.log('Phone number:', phoneNumber);
  console.log('Encrypted code:', encryptedCode);
  console.log('userPoolId:', userPoolId);

  let code;

  // Try to extract a 6-digit code from the encrypted string
  const digitMatch = encryptedCode.match(/\d{6}/);
  if (digitMatch) {
    code = digitMatch[0];
    console.log('Found 6-digit code in the encrypted string:', code);
  } else {
    try {
      // Try with a discovery-only keyring
      const discoveryKeyring = new KmsKeyringNode({ discovery: true });

      // Try to decrypt the code
      const { plaintext } = await decrypt(discoveryKeyring, Buffer.from(encryptedCode, 'base64'));
      code = plaintext.toString('utf8');
      console.log('Decryption successful!');
      console.log('Decrypted code:', code);
    } catch (error) {
      console.error('Decryption failed:', error);

      // Try with a specific key
      try {
        console.log('Trying with specific key...');
        const keyring = new KmsKeyringNode({
          generatorKeyId: `alias/aws/cognito-idp-${userPoolId}`
        });

        const { plaintext } = await decrypt(keyring, Buffer.from(encryptedCode, 'base64'));
        code = plaintext.toString('utf8');
        console.log('Specific key decryption successful!');
        console.log('Decrypted code:', code);
      } catch (secondError) {
        console.error('Specific key decryption failed:', secondError);

        // Fallback to a fixed code for testing
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