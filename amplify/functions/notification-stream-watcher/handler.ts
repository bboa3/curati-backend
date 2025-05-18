import { env } from '$amplify/env/notification-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { postNotificationCreation } from './triggers/post-notification-creation';
dayjs.extend(utc);
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
        await postNotificationCreation({
          notificationImage: newImage,
          dbClient: client,
          logger
        });
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};