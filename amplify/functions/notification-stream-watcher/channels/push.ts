import { Logger } from '@aws-lambda-powertools/logger';
import { PushMessage } from "../helpers/types";

interface SenderInput {
  userId: string
  message: PushMessage
  logger: Logger;
  dbClient: any;
}

export const sendPush = async ({ message, logger, dbClient, userId }: SenderInput) => {

}