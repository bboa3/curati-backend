import { env } from '$amplify/env/contract-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { ContractStatus } from '../helpers/types/schema';
import { postContractConfirmation } from './triggers/post-contract-confirmation';
import { postContractCreation } from './triggers/post-contract-creation';
import { postContractPayment } from './triggers/post-contract-payment';

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
        await postContractCreation({
          contractImage: newImage,
          dbClient: client,
          logger
        });
      } else if (record.eventName === "MODIFY") {
        const oldStatus = oldImage?.status?.S as ContractStatus | undefined;
        const newStatus = newImage?.status?.S as ContractStatus | undefined;

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        const isJustConfirmed = oldStatus === ContractStatus.PENDING_CONFIRMATION && (newStatus === ContractStatus.PENDING_PAYMENT)
        if (isJustConfirmed) {
          await postContractConfirmation({
            contractImage: newImage,
            dbClient: client,
            logger
          });
          continue;
        }

        if (oldStatus === ContractStatus.PENDING_PAYMENT && newStatus === ContractStatus.ACTIVE) {
          await postContractPayment({
            contractImage: newImage,
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