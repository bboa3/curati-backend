import { AppointmentParticipantType, NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getAppointmentReminderTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const appNameToUse = templateData.recipientType === AppointmentParticipantType.PROFESSIONAL ? "Cúrati Rx" : "Cúrati";
  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })

  const textParts = getAppointmentReminderTextParts(templateData, brandConfig.appName);

  const title = `${brandConfig.appName}: ${textParts.title}`;
  let body = textParts.line1.replace(/<strong>|<\/strong>/g, '');
  body = body.replace(` (${templateData.purpose})`, '');
  body = body.substring(0, 150) + (body.length > 150 ? "..." : "");
  if (textParts.line3ActionInstruction && (body.length + textParts.line3ActionInstruction.length < 170)) {
    body += ` ${textParts.line3ActionInstruction.split('.')[0]}.`;
  }

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};