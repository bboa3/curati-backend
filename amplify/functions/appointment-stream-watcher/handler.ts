import { env } from '$amplify/env/prescription-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AppointmentStatus } from '../helpers/types/schema';
import { postAppointmentCancellation } from './triggers/post-appointment-cancellation';
import { postAppointmentConfirmation } from './triggers/post-appointment-confirmation';
import { postAppointmentCreation } from './triggers/post-appointment-creation';
import { postAppointmentReadyForConfirmation } from './triggers/post-appointment-ready-for-confirmation';
import { postAppointmentStarted } from './triggers/post-appointment-started';
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
        const newStatus = newImage?.status?.S as AppointmentStatus | undefined;

        await postAppointmentCreation({
          appointmentImage: newImage,
          dbClient: client,
          logger
        });

        if (newStatus === AppointmentStatus.PENDING_CONFIRMATION) {
          await postAppointmentReadyForConfirmation({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });
        }
      } else if (record.eventName === "MODIFY") {
        const oldStatus = oldImage?.status?.S as AppointmentStatus | undefined;
        const newStatus = newImage?.status?.S as AppointmentStatus | undefined;
        const originalAppointmentDateTime = oldImage?.appointmentDateTime?.S as string | undefined;

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        if (newStatus === AppointmentStatus.PENDING_CONFIRMATION || newStatus === AppointmentStatus.RESCHEDULED) {
          await postAppointmentReadyForConfirmation({
            appointmentImage: newImage,
            dbClient: client,
            logger,
            originalAppointmentDateTime
          });
        }

        if (newStatus === AppointmentStatus.CONFIRMED || newStatus === AppointmentStatus.CANCELLED || newStatus === AppointmentStatus.FAILED) {
          const oldImageStatus = oldImage?.status?.S as AppointmentStatus | undefined;

          if (!oldImageStatus) {
            logger.error(`Missing oldImageStatus for record ${record.eventID}`);
            continue;
          }

          await postAppointmentConfirmation({
            appointmentImage: newImage,
            oldImageStatus: oldImageStatus,
            dbClient: client,
            logger
          });
        }

        if (newStatus === AppointmentStatus.CANCELLED || newStatus === AppointmentStatus.FAILED) {
          await postAppointmentCancellation({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });
        }

        if (newStatus === AppointmentStatus.IN_PROGRESS) {
          await postAppointmentStarted({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Notify parties, create/update consultation record
        }

        // if (newStatus === AppointmentStatus.COMPLETED) {
        //   await postAppointmentCompleted({
        //     appointmentImage: newImage,
        //     dbClient: client,
        //     logger
        //   });

        //   /// Notify parties, update consultation record, trigger follow-ups
        // }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};