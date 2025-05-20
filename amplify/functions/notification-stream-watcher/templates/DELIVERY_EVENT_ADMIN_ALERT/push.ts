import { NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getAdminDeliveryAlertTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Admin' });
  const statusParts = getAdminDeliveryAlertTextParts(templateData);

  const title = `${brandConfig.appName}: ${statusParts.title} (#${templateData.deliveryNumber})`;
  let body = `${statusParts.line1.substring(0, 70)}${statusParts.line1.length > 70 ? '...' : ''}`;
  if (statusParts.line2 && (body.length + statusParts.line2.length < 120)) body += ` ${statusParts.line2.split('.')[0]}.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};