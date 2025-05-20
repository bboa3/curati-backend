import { Logger } from '@aws-lambda-powertools/logger';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Priority, User } from '../../helpers/types/schema';
import { PushMessage } from "../helpers/types";

const expo = new Expo({
  // accessToken: env.EXPO_ACCESS_TOKEN
});

interface SenderInput {
  userId: string
  message: PushMessage
  logger: Logger;
  dbClient: any;
}

export const sendPush = async ({ message, logger, dbClient, userId }: SenderInput) => {
  const { pushTokens, title, body, payload, priority } = message;
  const messages: ExpoPushMessage[] = [];

  for (const pushToken of pushTokens) {

    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      logger.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      title,
      body,
      data: payload as Record<string, unknown>,
      priority: (priority === Priority.HIGH || priority === Priority.MEDIUM) ? "high" : "normal",
    })
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  await (async () => {
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      logger.info(`Sent ${ticketChunk.length} push notifications`);
      tickets.push(...ticketChunk);
    }
  })();

  await (async () => {
    for (const ticketIndex in tickets) {
      const ticket = tickets[ticketIndex];

      if (ticket.status === 'error' && ticket.details && ticket.details.error === 'DeviceNotRegistered') {
        const pushToken = messages[ticketIndex].to;

        const { data: userData, errors: userErrors } = await dbClient.models.user.get({ authId: userId });

        if (userErrors || !userData) {
          logger.error('Failed to fetch user:', userErrors);
          continue;
        }
        const user = userData as unknown as User;
        const filteredPushTokens = user.pushTokens.filter((token) => token?.split(' ')[0] !== pushToken);

        const { errors: userUpdateErrors } = await dbClient.models.user.update({
          authId: userId,
          pushTokens: filteredPushTokens
        })

        if (userUpdateErrors) {
          logger.error('Failed to update user:', userUpdateErrors);
          continue;
        }
      }
    }

  })();
}