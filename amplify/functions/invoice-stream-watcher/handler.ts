import { env } from '$amplify/env/medicine-order-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { InvoiceStatus } from '../helpers/types/schema';
import { postInvoiceCancellation } from './triggers/post-invoice-cancellation';
import { postInvoiceCreation } from './triggers/post-invoice-creation';
import { postInvoicePayment } from './triggers/post-invoice-payment';
import { postInvoiceReadyForPayment } from './triggers/post-invoice-ready-for-payment';

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
        const newStatus = newImage?.status?.S as InvoiceStatus | undefined;

        await postInvoiceCreation({
          invoiceImage: newImage,
          dbClient: client,
          logger
        })

        if (newStatus === InvoiceStatus.PENDING_PAYMENT) {
          await postInvoiceReadyForPayment({
            invoiceImage: newImage,
            dbClient: client,
            logger
          })
        }

      } else if (record.eventName === "MODIFY") {
        const oldStatus = oldImage?.status?.S as InvoiceStatus | undefined;
        const newStatus = newImage?.status?.S as InvoiceStatus | undefined;

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        if (newStatus === InvoiceStatus.PENDING_PAYMENT) {
          await postInvoiceReadyForPayment({
            invoiceImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === InvoiceStatus.PAID) {
          await postInvoicePayment({
            invoiceImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === InvoiceStatus.FAILED || newStatus === InvoiceStatus.OVERDUE) {
          await postInvoiceCancellation({
            invoiceImage: newImage,
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