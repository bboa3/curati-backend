import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';
import { getPatientDeliveryStatusTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;
  const statusParts = getPatientDeliveryStatusTextParts(templateData);

  let body = `${header}Entrega #${templateData.deliveryNumber}: ${statusParts.title}. ${statusParts.line1.substring(0, 70)}${statusParts.line1.length > 70 ? '...' : ''}`;
  if (statusParts.primaryButtonText && deepLink && (body.length + deepLink.length < 150)) {
    body += ` ${deepLink}`;
  }

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};