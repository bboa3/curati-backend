import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';
import { getAdminDeliveryAlertTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Admin' });
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;
  const statusParts = getAdminDeliveryAlertTextParts(templateData);

  if (!statusParts.isCritical && !statusParts.isWarning) return { phoneNumbers: [], body: "" };

  let body = `${header}${statusParts.title} (Entrega #${templateData.deliveryNumber}). ${statusParts.line1.substring(0, 50)}...`;
  if (deepLink && (body.length + deepLink.length < 150)) {
    body += ` Ver: ${deepLink}`;
  }

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};