import { Notification, NotificationChannel, NotificationChannelType } from '../../../helpers/types/schema';
import { EmailMessage, InAppMessage, Message, PushMessage, SmsMessage } from '../../helpers/types';
import { generateEmailMessage } from './email';
import { generateInAppMessage } from './in-app';
import { generatePushMessage } from './push';
import { TemplateData, TemplateValidatorSchema } from './schema';
import { generateSmsMessage } from './sms';

interface TemplateInput {
  notification: Notification
}

export const generateInvoiceCreatedMessages = async ({ notification }: TemplateInput): Promise<Message> => {
  const channels = notification.channels as NotificationChannel[];
  const templateData = notification.templateData as TemplateData;

  await TemplateValidatorSchema.validate(templateData);

  let emailMessage: EmailMessage | null = null;
  let smsMessage: SmsMessage | null = null;
  let pushMessage: PushMessage | null = null;
  let inAppMessage: InAppMessage | null = null;

  const emailChannel = channels.find(channel => channel.type === NotificationChannelType.EMAIL);
  const smsChannel = channels.find(channel => channel.type === NotificationChannelType.SMS);
  const pushChannel = channels.find(channel => channel.type === NotificationChannelType.PUSH);
  const inAppChannel = channels.find(channel => channel.type === NotificationChannelType.IN_APP);

  if (emailChannel) {
    emailMessage = generateEmailMessage({
      channel: emailChannel,
      templateData: templateData,
      payload: notification.payload
    });
  }

  if (smsChannel) {
    smsMessage = generateSmsMessage({
      channel: smsChannel,
      templateData: templateData,
      payload: notification.payload
    });
  }

  if (pushChannel) {
    pushMessage = generatePushMessage({
      channel: pushChannel,
      templateData: templateData,
      payload: notification.payload,
      priority: notification.priority
    });
  }

  if (inAppChannel) {
    inAppMessage = generateInAppMessage({
      channel: inAppChannel,
      templateData: templateData
    });
  }

  return {
    email: emailMessage,
    sms: smsMessage,
    push: pushMessage,
    inApp: inAppMessage
  }
};