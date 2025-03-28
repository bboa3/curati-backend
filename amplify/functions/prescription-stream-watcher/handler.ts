import { env } from '$amplify/env/prescription-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { PrescriptionStatus } from '../helpers/types/schema';
import { postPrescriptionCreation } from './triggers/post-prescription-creation';
import { postPrescriptionValidation } from './triggers/post-prescription-validation';

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

      const prescriptionImage = record.dynamodb?.NewImage;
      if (!prescriptionImage) {
        continue;
      }

      if (record.eventName === "INSERT") {
        await postPrescriptionCreation({
          prescriptionImage,
          dbClient: client,
          logger
        });
      } else if (record.eventName === "MODIFY") {
        const status = prescriptionImage?.status?.S as PrescriptionStatus;

        if (status === PrescriptionStatus.ACTIVE) {
          await postPrescriptionValidation({
            prescriptionImage,
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