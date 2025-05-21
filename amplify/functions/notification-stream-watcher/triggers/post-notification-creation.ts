import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Notification } from '../../helpers/types/schema';
import { sendMessage } from "../channels";
import { generateMessages } from "../templates";

interface TriggerInput {
  notificationImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postNotificationCreation = async ({ notificationImage, dbClient, logger }: TriggerInput) => {
  const notification = unmarshall(notificationImage as any) as Notification;

  const message = await generateMessages({ notification })

  logger.info("Notification message", { message });

  await sendMessage({
    message: message,
    logger: logger,
    dbClient: dbClient,
    userId: notification.userId,
    notificationId: notification.id
  });
};