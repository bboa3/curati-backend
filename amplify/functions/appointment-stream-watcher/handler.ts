import { env } from '$amplify/env/prescription-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { AppointmentStatus } from '../helpers/types/schema';
import { postAppointmentCancelled } from './triggers/post-appointment-cancelled';
import { postAppointmentCompleted } from './triggers/post-appointment-completed';
import { postAppointmentConfirmation } from './triggers/post-appointment-confirmation';
import { postAppointmentFailed } from './triggers/post-appointment-failed';
import { postAppointmentReadyForConfirmation } from './triggers/post-appointment-ready-for-confirmation';
import { postAppointmentRescheduled } from './triggers/post-appointment-rescheduled';
import { postAppointmentStarted } from './triggers/post-appointment-started';

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

        if (oldStatus === newStatus) {
          logger.info(`Skipping record ${record.eventID}: Status did not change ('${newStatus}').`);
          continue;
        }

        if (newStatus === AppointmentStatus.PENDING_CONFIRMATION) {
          await postAppointmentReadyForConfirmation({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Notify the relevant party to confirm
        }

        if (newStatus === AppointmentStatus.CONFIRMED) {
          await postAppointmentConfirmation({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Notify both parties, schedule reminders
          // Schedule a reminder (e.g., 24h and 1h before)
        }

        if (newStatus === AppointmentStatus.IN_PROGRESS) {
          await postAppointmentStarted({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Notify parties, create/update consultation record
        }

        if (newStatus === AppointmentStatus.COMPLETED) {
          await postAppointmentCompleted({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          /// Notify parties, update consultation record, trigger follow-ups
        }

        if (newStatus === AppointmentStatus.CANCELLED) {
          await postAppointmentCancelled({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Notify parties, handle fees/refunds, cancel reminders
        }

        if (newStatus === AppointmentStatus.RESCHEDULED) {
          await postAppointmentRescheduled({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Notify parties, cancel old reminders, schedule new ones
        }

        if (newStatus === AppointmentStatus.FAILED) {
          await postAppointmentFailed({
            appointmentImage: newImage,
            dbClient: client,
            logger
          });

          // Log, notify relevant admin/support
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};