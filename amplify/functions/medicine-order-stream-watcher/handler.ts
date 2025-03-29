import { env } from '$amplify/env/medicine-order-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { MedicineOrderStatus } from '../helpers/types/schema';
import { postMedicineOrderCancellation } from './triggers/post-medicine-order-cancellation';
import { postMedicineOrderPayment } from './triggers/post-medicine-order-payment';
import { postMedicineOrderReadyForDispatch } from './triggers/post-medicine-order-ready-for-dispatch';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const client = generateClient<any>();

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    try {
      logger.info(`Processing record: ${record.eventID}`);

      const oldImage = record.dynamodb?.OldImage;
      const newImage = record.dynamodb?.NewImage;

      logger.info(`Old Image: ${JSON.stringify(oldImage)}`);
      logger.info(`New Image: ${JSON.stringify(newImage)}`);

      if (!newImage) {
        continue;
      }

      if (record.eventName === "MODIFY") {
        const oldStatus = oldImage?.status?.S as MedicineOrderStatus | undefined;
        const newStatus = newImage?.status?.S as MedicineOrderStatus | undefined;

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        if (newStatus === MedicineOrderStatus.PROCESSING) {
          await postMedicineOrderPayment({
            medicineOrderImage: newImage,
            dbClient: client,
            logger
          });
        }

        if (newStatus === MedicineOrderStatus.CANCELED || newStatus === MedicineOrderStatus.REJECTED) {
          await postMedicineOrderCancellation({
            medicineOrderImage: newImage,
            dbClient: client,
            logger
          });
        }

        if (newStatus === MedicineOrderStatus.READY_FOR_DISPATCH) {
          await postMedicineOrderReadyForDispatch({
            medicineOrderImage: newImage,
            dbClient: client,
            logger
          });
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};