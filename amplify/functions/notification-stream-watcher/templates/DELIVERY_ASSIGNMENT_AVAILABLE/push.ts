import { NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const { deliveryNumber, offerExpiryInfo } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati Go" })

  const title = `${brandConfig.appName}: Nova Entrega Disponível!`;

  let body = `Entrega #${deliveryNumber} na sua área.`;
  if (offerExpiryInfo) {
    body += ` ${offerExpiryInfo} Toque para ver e aceitar.`;
  } else {
    body += ` Aja rápido! Toque para ver e aceitar.`;
  }

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};