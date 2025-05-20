import { NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getPatientDeliveryStatusTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const statusParts = getPatientDeliveryStatusTextParts(templateData);

  const title = `${brandConfig.appName}: ${statusParts.title}`;
  const body = `${statusParts.line1.substring(0, 100)}${statusParts.line1.length > 100 ? '...' : ''}${statusParts.line2 ? ` ${statusParts.line2.substring(0, 50)}${statusParts.line2.length > 50 ? '...' : ''}` : ''}`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};