import { InAppMessage } from "../helpers/types";

interface SenderInput {
  notificationId: string
  message: InAppMessage
  dbClient: any;
}

export const sendInApp = async ({ dbClient, message, notificationId }: SenderInput) => {
  const { errors: userUpdateErrors } = await dbClient.models.notification.update({
    id: notificationId,
    title: message.title,
    shortMessage: message.shortMessage,
    message: message.message,
    isInAppEnabled: true
  })

  if (userUpdateErrors) {
    throw new Error(`Failed to update user: ${JSON.stringify(userUpdateErrors)}`);
  }
}