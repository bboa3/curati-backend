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
  const { prescriptionNumber, patientName } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const title = `${brandConfig.appName} Admin: Validar Receita`;
  let body = `Nova receita #${prescriptionNumber}`;
  if (patientName) body += ` para ${patientName}`;
  body += ` aguarda validação.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};