import { env } from '$amplify/env/post-medicine-order-creation';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { Schema } from '../../data/resource';
import { pharmacyEmailNotifier } from './helpers/send-email';
import { pharmacySMSNotifier } from './helpers/send-sms';
import { updateInventories } from './helpers/updateInventories';
import { updatePrescription } from './helpers/updatePrescription';

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
        const delivery = record.dynamodb?.NewImage;
        const orderId = delivery?.id?.S;

        if (!orderId) {
          logger.warn("Missing required order fields");
          continue;
        }

        const { data: orderData, errors: orderErrors } = await client.models.medicineOrder.get({ id: orderId });

        if (orderErrors || !orderData) {
          logger.error("Failed to fetch order", { errors: orderErrors });
          continue;
        }
        const order = orderData as unknown as MedicineOrder

        const { data: pharmacists, errors: pharmacistErrors } = await client.models.professional.list({
          filter: { businessId: { eq: order.businessId } }
        });

        if (pharmacistErrors || !pharmacists) {
          logger.error("Failed to fetch pharmacists", { errors: pharmacistErrors });
          continue;
        }

        await updateInventories({
          client,
          logger,
          orderId
        })

        if (order.prescriptionId) {
          await updatePrescription({
            client,
            logger,
            prescriptionId: order.prescriptionId
          })
        }

        const emails = pharmacists.map((p: Pharmacist) => p.email).filter(Boolean);
        const phones = pharmacists.map((p: Pharmacist) => `+258${p.phone.replace(/\D/g, '')}`).filter(Boolean);
        if (emails.length > 0) {
          await pharmacyEmailNotifier(
            emails,
            order.orderNumber
          );
        }

        if (phones.length > 0) {
          await Promise.all(phones.map((phone) => pharmacySMSNotifier(phone, order.orderNumber)));
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};