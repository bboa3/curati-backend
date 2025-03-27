import { env } from '$amplify/env/post-prescription-creation';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from "@aws-lambda-powertools/logger";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { Schema } from '../../data/resource';
import { adminEmailNotifier } from './helpers/send-email';
import { adminSMSNotifier } from './helpers/send-sms';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const client = generateClient<any>();

type User = Schema['user']['type'];

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    try {
      logger.info(`Processing record: ${record.eventID}`);

      if (record.eventName === "INSERT") {
        const prescription = record.dynamodb?.NewImage;
        const prescriptionNumber = prescription?.prescriptionNumber?.S;

        if (!prescriptionNumber) {
          logger.warn("Missing required prescription fields");
          continue;
        }

        const { data: admins, errors: adminErrors } = await client.models.user.list({
          filter: { role: { eq: 'ADMIN' } }
        });

        if (adminErrors || !admins || admins.length === 0) {
          logger.error("Failed to fetch admins", { errors: adminErrors });
          continue;
        }

        const emails = admins.map((p: User) => p.email).filter(Boolean) as string[];
        const phones = admins.map((p: User) => p.phone ? `+258${p.phone.replace(/\D/g, '')}` : null).filter(Boolean) as string[];
        if (emails.length > 0) {
          await adminEmailNotifier(
            emails,
            prescriptionNumber
          );
        }

        if (phones.length > 0) {
          await Promise.all(phones.map((phone) => phone ? adminSMSNotifier(phone, prescriptionNumber) : null));
        }
      }
    } catch (error) {
      logger.error("Error processing record", { error });
    }
  }

  return { batchItemFailures: [] };
};