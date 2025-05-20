import { NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getContractStatusPatientTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const textParts = getContractStatusPatientTextParts(templateData, brandConfig.appName);
  const title = `${brandConfig.appName}: ${textParts.title}`;
  const body = `Contrato #${templateData.contractNumber}: ${textParts.line1.replace(/<strong>|<\/strong>/g, '').substring(0, 100)}... Toque para detalhes.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};