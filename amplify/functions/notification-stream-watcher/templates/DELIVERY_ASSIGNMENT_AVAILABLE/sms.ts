import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
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
  const { deliveryNumber, offerExpiryInfo } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati Go" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;

  let body = `${header}Nova entrega #${deliveryNumber} disponível!`;
  if (offerExpiryInfo) {
    body += ` ${offerExpiryInfo.replace("Esta oferta expira em ", "Expira:").replace("Disponível por tempo limitado", "Tempo limitado!")}`;
  } else {
    body += ` Aja rápido!`;
  }
  body += ` Ver/Aceitar: ${deepLink}`;

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};