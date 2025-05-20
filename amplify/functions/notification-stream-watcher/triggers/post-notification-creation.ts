import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";

interface TriggerInput {
  notificationImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postNotificationCreation = async ({ notificationImage, dbClient, logger }: TriggerInput) => {

};