import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { DeliveryAssignmentStatus } from '../helpers/types/schema';
import { postDeliveryAssignmentAccepted } from './triggers/post-delivery-assignment-accepted';
import { postDeliveryAssignmentCreation } from './triggers/post-delivery-assignment-creation';
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
      logger.info(`Processing record: ${record.eventID}`,);

      const oldImage = record.dynamodb?.OldImage;
      const newImage = record.dynamodb?.NewImage;

      logger.info(`Old Image: ${JSON.stringify(oldImage)}`);
      logger.info(`New Image: ${JSON.stringify(newImage)}`);

      if (!newImage) {
        continue;
      }

      if (record.eventName === "INSERT") {
        await postDeliveryAssignmentCreation({
          deliveryAssignmentImage: newImage,
          dbClient: client,
          logger
        });

      } else if (record.eventName === "MODIFY") {
        const oldStatus = oldImage?.status?.S as DeliveryAssignmentStatus;
        const newStatus = newImage?.status?.S as DeliveryAssignmentStatus;

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        if (newStatus === DeliveryAssignmentStatus.ACCEPTED) {
          await postDeliveryAssignmentAccepted({
            deliveryAssignmentImage: newImage,
            dbClient: client,
            logger
          })
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};