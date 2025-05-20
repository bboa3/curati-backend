import { NotificationChannel, NotificationPayload, UserRole } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const { recipientRole } = templateData;
  const isPharmacist = recipientRole === UserRole.PROFESSIONAL;
  const appNameToUse = isPharmacist ? "Cúrati RX" : "Cúrati Admin";

  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;

  let body = `${header}Novo Pedido #${templateData.orderNumber}! Pac: ${templateData.patientName?.split(' ')[0] || ''}.`;
  if (templateData.itemCount) {
    body += ` Itens: ${templateData.itemCount}.`;
  }
  body += ` Processar: ${deepLink}`;

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};