import { env } from '$amplify/env/new-medicine-order-pharmacy-notifier';
import { Logger } from "@aws-lambda-powertools/logger";
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import type { DynamoDBStreamHandler } from "aws-lambda";
const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const sesClient = new SESv2Client({});

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    logger.info(`Processing record: ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      logger.info(`New Image: ${JSON.stringify(record.dynamodb?.NewImage)}`);
    }
  }
  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};


export async function sendOrderNotificationEmail(
  toAddresses: string[],
  pharmacyName: string,
  orderDetails: string,
  orderId: string
) {
  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    ReplyToAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
    Content: {
      Simple: {
        Subject: {
          Data: "New Medicine Order Notification",
        },
        Body: {
          Html: {
            Data: `
            <html>
            <body>
              <h1>New Medicine Order</h1>
              <p>A new medicine order has been placed at ${pharmacyName}.</p>
              <p>Order ID: ${orderId}</p>
              <p>Order Details:</p>
              <pre>${orderDetails}</pre>
              <p>Please review the order in the system.</p>
            </body>
            </html>
          `,
          },
          Text: {
            Data: `New Medicine Order\n\nA new medicine order has been placed at ${pharmacyName}.\nOrder ID: ${orderId}\nOrder Details:\n${orderDetails}\n\nPlease review the order in the system.`,
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  try {
    const data = await sesClient.send(sendEmailCommand);
    logger.info(`Email sent successfully!, ${{ messageId: data.MessageId, recipient: toAddresses }}`);
  } catch (err) {
    logger.error(`Error sending email to ${toAddresses}: ${err}`);
    throw err;
  }
}
