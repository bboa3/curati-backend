import { env } from '$amplify/env/post-medicine-order-creation';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { Schema } from '../../data/resource';
import { sendNotificationEmail } from './helpers/send-email';
import { sendNotificationSMS } from './helpers/send-sms';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const client = generateClient<any>();

type Pharmacist = Schema['professional']['type'];
type MedicineOrder = Schema['medicineOrder']['type'];

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    try {
      logger.info(`Processing record: ${record.eventID}`);

      if (record.eventName === "INSERT") {
        const order = record.dynamodb?.NewImage;
        const orderId = order?.id?.S;
        const orderNumber = order?.orderNumber?.S;
        const pharmacyId = order?.businessId?.S;

        if (!orderId || !orderNumber || !pharmacyId) {
          logger.warn("Missing required order fields");
          continue;
        }

        const { data: pharmacists, errors: pharmacistErrors } = await client.models.professional.list({
          filter: { businessId: { eq: pharmacyId } }
        });

        if (pharmacistErrors || !pharmacists) {
          logger.error("Failed to fetch pharmacists", { errors: pharmacistErrors });
          continue;
        }

        const emails = pharmacists.map((p: Pharmacist) => p.email).filter(Boolean);
        const phones = pharmacists.map((p: Pharmacist) => `+258${p.phone.replace(/\D/g, '')}`).filter(Boolean);
        if (emails.length > 0) {
          await sendNotificationEmail(
            emails,
            orderNumber
          );
        }

        if (phones.length > 0) {
          await Promise.all(phones.map((phone) => sendNotificationSMS(phone, orderNumber)));
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};