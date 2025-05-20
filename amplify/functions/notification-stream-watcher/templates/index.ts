import { Notification, NotificationTemplateKey } from '../../helpers/types/schema';
import { Message } from '../helpers/types';
import * as generator from './generator';

interface TemplateInput {
  notification: Notification
}

const templateMap: Record<NotificationTemplateKey.INVOICE_CREATED, (input: TemplateInput) => Promise<Message>> = {
  [NotificationTemplateKey.INVOICE_CREATED]: generator.generateInvoiceCreatedMessages,
};

export const generateMessages = ({ notification }: TemplateInput) => {
  const generator = templateMap[notification.templateKey as NotificationTemplateKey.INVOICE_CREATED];

  if (!generator) {
    throw new Error(`No template generator found for key: ${notification.templateKey}`);
  }

  return generator({ notification });
};