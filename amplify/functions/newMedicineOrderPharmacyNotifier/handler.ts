import { env } from '$amplify/env/new-medicine-order-pharmacy-notifier';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { Schema } from '../../data/resource';
import { sendOrderNotificationEmail } from './utils/send-email';

Amplify.configure(
  {
    API: {
      GraphQL: {
        endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
        region: env.AWS_REGION,
        defaultAuthMode: "lambda",
      },
    },
  },
  {
    Auth: {
      credentialsProvider: {
        getCredentialsAndIdentityId: async () => ({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            sessionToken: env.AWS_SESSION_TOKEN,
          },
        }),
        clearCredentialsAndIdentityId: () => {
          /* noop */
        },
      },
    },
  }
);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const dbClient = generateClient<any>();

type Delivery = Schema['delivery']['type'];
type Pharmacist = Schema['professional']['type'];
type MedicineOrder = Schema['medicineOrder']['type'];

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    logger.info(`Processing record: ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      const delivery = record.dynamodb?.NewImage as unknown as Delivery;
      if (!delivery) throw new Error("Delivery not found");

      const { data: orderData } = await dbClient.models.medicineOrder.get({ id: delivery.orderId })

      const { data: pharmacistsData } = await dbClient.models.professional.list({
        filter: { businessId: { eq: delivery.pharmacyId } }
      })
      const order = orderData as unknown as MedicineOrder
      const pharmacists = pharmacistsData as unknown as Pharmacist[]

      if (!order || !pharmacists) throw Error('Order or pharmacists not found')

      const toAddresses = pharmacists.map(pharmacist => pharmacist.email);

      const data = await sendOrderNotificationEmail(toAddresses, order.orderNumber)

      logger.info("Email sent successfully!", { messageId: data.MessageId, recipients: toAddresses });
      logger.info(`New Image: ${JSON.stringify(record.dynamodb?.NewImage)}`);
    }
  }
  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};