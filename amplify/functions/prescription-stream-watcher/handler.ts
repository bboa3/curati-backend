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

      const oldImage = record.dynamodb?.OldImage;
      const newImage = record.dynamodb?.NewImage;

      logger.info(`Old Image: ${JSON.stringify(oldImage)}`);
      logger.info(`New Image: ${JSON.stringify(newImage)}`);

      if (!newImage) {
        continue;
      }

      if (record.eventName === "INSERT") {
        await postPrescriptionCreation({
          prescriptionImage: newImage,
          dbClient: client,
          logger
        });
      } else if (record.eventName === "MODIFY") {
        const status = newImage?.status?.S as PrescriptionStatus;

        const isJustValidated = (!oldImage?.validatedAt && !!newImage.validatedAt) && status === PrescriptionStatus.ACTIVE;

        if (isJustValidated) {
          await postPrescriptionValidation({
            prescriptionImage: newImage,
            dbClient: client,
            logger
          });
        } else {
          logger.info(`Skipping postPrescriptionValidation for ${record.eventID}: validatedAt did not just change.`);
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};