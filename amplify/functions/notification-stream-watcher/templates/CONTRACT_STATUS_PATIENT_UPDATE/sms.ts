import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';
import { getContractStatusPatientTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;
  const textParts = getContractStatusPatientTextParts(templateData, brandConfig.appName);


  let body = `${header}${textParts.title} (Contrato #${templateData.contractNumber}). ${textParts.line1.split('.')[0].replace(/<strong>|<\/strong>/g, '')}.`;
  if (textParts.primaryButtonText && deepLink && (body.length + deepLink.length < 150)) {
    body += ` Ação: ${deepLink}`;
  }

  return { phoneNumbers: channel.targets, body: body.substring(0, 160) };
};