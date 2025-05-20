import { Logger } from "@aws-lambda-powertools/logger";
import { Message } from "../helpers/types";
import { sendEmail } from "./email";
import { sendInApp } from "./in-app";
import { sendPush } from "./push";
import { sendSms } from "./sms";

interface SenderInput {
  notificationId: string
  userId: string
  message: Message
  logger: Logger;
  dbClient: any;
}


export const sendMessage = async ({ message, logger, dbClient, userId, notificationId }: SenderInput) => {
  if (message.email) {
    await sendEmail({
      message: message.email
    });
  }

  if (message.sms) {
    await sendSms({
      message: message.sms
    });
  }

  if (message.push) {
    await sendPush({
      message: message.push,
      userId: userId,
      logger: logger,
      dbClient: dbClient
    });
  }

  if (message.inApp) {
    await sendInApp({
      message: message.inApp,
      notificationId: notificationId,
      dbClient: dbClient
    });
  }
}