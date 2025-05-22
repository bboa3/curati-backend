import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';
import { getDriverDeliveryStatusTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Go' });
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;
  const statusParts = getDriverDeliveryStatusTextParts(templateData);

  let body = `${header}${statusParts.title} (Entrega #${templateData.deliveryNumber}). ${statusParts.line1.split('.')[0]}.`;

  if (statusParts.primaryButtonText && deepLink && (body.length + deepLink.length < 150)) {
    body += ` App: ${deepLink}`;
  } else if (statusParts.isNegative) {
    body += ` Contacte suporte.`;
  }

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};