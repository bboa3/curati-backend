import { env } from '$amplify/env/post-medicine-order-creation';
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

      const medicineOrderImage = record.dynamodb?.NewImage;
      if (!medicineOrderImage) {
        continue;
      }

      if (record.eventName === "MODIFY") {
        const status = medicineOrderImage?.status?.S as MedicineOrderStatus;

        if (status === MedicineOrderStatus.PROCESSING) {
          await postMedicineOrderPayment({
            medicineOrderImage,
            dbClient: client,
            logger
          });
        }

        if (status === MedicineOrderStatus.CANCELED || status === MedicineOrderStatus.REJECTED) {
          await postMedicineOrderCancellation({
            medicineOrderImage,
            dbClient: client,
            logger
          });
        }

        if (status === MedicineOrderStatus.READY_FOR_DISPATCH) {
          await postMedicineOrderReadyForDispatch({
            medicineOrderImage,
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