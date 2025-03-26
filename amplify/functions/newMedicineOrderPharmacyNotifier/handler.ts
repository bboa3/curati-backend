import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import amplify_outputs from '../../../amplify_outputs.json';
import { Schema } from '../../data/resource';
import { sendOrderNotificationEmail } from './utils/send-email';

Amplify.configure(amplify_outputs);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const client = generateClient<any>({
  authMode: 'lambda'
});

type Delivery = Schema['delivery']['type'];
type Pharmacist = Schema['professional']['type'];
type MedicineOrder = Schema['medicineOrder']['type'];

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    try {
      logger.info(`Processing record: ${record.eventID}`);

      if (record.eventName === "INSERT") {
        const delivery = record.dynamodb?.NewImage;
        const orderId = delivery?.orderId?.S;
        const pharmacyId = delivery?.pharmacyId?.S;

        if (!orderId || !pharmacyId) {
          logger.warn("Missing required delivery fields");
          continue;
        }

        const { data: order, errors: orderErrors } = await client.models.medicineOrder.get({
          id: orderId
        });

        if (orderErrors || !order) {
          logger.error("Failed to fetch order", { errors: orderErrors });
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
        const orderNumber = (order as unknown as MedicineOrder).orderNumber;
        if (emails.length > 0) {
          await sendOrderNotificationEmail(
            emails,
            orderNumber
          );
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};