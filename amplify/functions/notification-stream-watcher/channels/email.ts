import { env } from '$amplify/env/notification-stream-watcher';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';
import { EmailMessage } from "../helpers/types";

const client = new SESv2Client();

interface SenderInput {
  message: EmailMessage
}

export const sendEmail = async ({ message }: SenderInput) => {
  const { emailAddresses, subject, textBody, htmlBody } = message;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: emailAddresses,
    },
    ReplyToAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}