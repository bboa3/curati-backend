import { env } from '$amplify/env/new-validated-prescription-patient-notifier';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { Schema } from '../../data/resource';
import { sendNotificationEmail } from './utils/send-email';
import { sendNotificationSMS } from './utils/send-sms';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const client = generateClient<any>();

type Patient = Schema['patient']['type'];

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    try {
      logger.info(`Processing record: ${record.eventID}`);

      if (record.eventName === "MODIFY") {
        const prescription = record.dynamodb?.NewImage;
        const prescriptionNumber = prescription?.prescriptionNumber?.S;
        const patientId = prescription?.patientId?.S;

        if (!prescriptionNumber || !patientId) {
          logger.warn("Missing required prescription fields");
          continue;
        }

        const { data: patient, errors: patientErrors } = await client.models.patient.get({ userId: patientId });

        if (patientErrors || !patient) {
          logger.error("Failed to fetch patient", { errors: patientErrors });
          continue;
        }

        const { name, email, phone } = patient as unknown as Patient;

        if (email) {
          await sendNotificationEmail(
            name,
            [email],
            prescriptionNumber
          );
        }

        if (phone) {
          await sendNotificationSMS(
            name,
            `+258${phone.replace(/\D/g, '')}`,
            prescriptionNumber
          );
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};