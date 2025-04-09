import { env } from '$amplify/env/delivery-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { DeliveryStatus } from '../helpers/types/schema';
import { postDeliveryCreation } from './triggers/post-delivery-creation';
import { postDeliveryDelivered } from './triggers/post-delivery-delivered';
import { postDeliveryFailed } from './triggers/post-delivery-failed';
import { postDeliveryInTransit } from './triggers/post-delivery-in-transit';
import { postDeliveryPickedUpByDriver } from './triggers/post-delivery-picked-up-by-driver';
import { postDeliveryPickedUpByPatient } from './triggers/post-delivery-picked-up-by-patient';
import { postDeliveryPreparing } from './triggers/post-delivery-preparing';
import { postDeliveryReadyForDriverAssignment } from './triggers/post-delivery-ready-for-driver-assignment';
import { postDeliveryReadyForPatientPickup } from './triggers/post-delivery-ready-for-patient-pickup';
import { postMedicineOrderCreation } from './triggers/post-medicine-order-creation';
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
        await postDeliveryCreation({
          deliveryImage: newImage,
          dbClient: client,
          logger
        });

        await postMedicineOrderCreation({
          deliveryImage: newImage,
          dbClient: client,
          logger
        });

      } else if (record.eventName === "MODIFY") {
        const oldStatus = oldImage?.status?.S as DeliveryStatus;
        const newStatus = newImage?.status?.S as DeliveryStatus;

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        if (newStatus === DeliveryStatus.PHARMACY_PREPARING) {
          await postDeliveryPreparing({
            deliveryImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT) {
          await postDeliveryReadyForDriverAssignment({
            deliveryImage: newImage,
            dbClient: client,
            logger
          });
        }

        if (newStatus === DeliveryStatus.PICKED_UP_BY_DRIVER) {
          await postDeliveryPickedUpByDriver({
            deliveryImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === DeliveryStatus.IN_TRANSIT) {
          await postDeliveryInTransit({
            deliveryImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === DeliveryStatus.DELIVERED) {
          await postDeliveryDelivered({
            deliveryImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === DeliveryStatus.AWAITING_PATIENT_PICKUP) {
          await postDeliveryReadyForPatientPickup({
            deliveryImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === DeliveryStatus.PICKED_UP_BY_PATIENT) {
          await postDeliveryPickedUpByPatient({
            deliveryImage: newImage,
            dbClient: client,
            logger
          })
        }

        if (newStatus === DeliveryStatus.CANCELLED || newStatus === DeliveryStatus.FAILED) {
          await postDeliveryFailed({
            deliveryImage: newImage,
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