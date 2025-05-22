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
  const {
    professionalName
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const joinVirtualCallDeepLink = payload.href ? payload.href : '';

  const body = `${header}${professionalName.split(' ')[0]} está à sua espera para a consulta. Entre agora: ${joinVirtualCallDeepLink}`;

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};