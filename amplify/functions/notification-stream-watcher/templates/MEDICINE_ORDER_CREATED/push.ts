import { NotificationChannel, NotificationPayload, Priority, UserRole } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getMedicineOrderCreatedTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const { recipientRole } = templateData;
  const isPharmacist = recipientRole === UserRole.PROFESSIONAL;
  const appNameToUse = isPharmacist ? "Cúrati RX" : "Cúrati Admin";

  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const textParts = getMedicineOrderCreatedTextParts(templateData, brandConfig.appName);

  const title = `${brandConfig.appName}: ${textParts.title}`;
  const body = textParts.line1.replace(/<[^>]+>/g, '');

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};