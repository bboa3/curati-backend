import { AppointmentParticipantType, NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getAppointmentReminderTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const appNameToUse = templateData.recipientType === AppointmentParticipantType.PROFESSIONAL ? "Cúrati Rx" : "Cúrati";
  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })

  const textParts = getAppointmentReminderTextParts(templateData, brandConfig.appName);
  const title = textParts.title;

  let shortMessage = textParts.line1.replace(/<strong>|<\/strong>/g, '');
  shortMessage = shortMessage.replace(` (${templateData.purpose})`, '');
  shortMessage = shortMessage.substring(0, 100) + (shortMessage.length > 100 ? "..." : "");

  let fullMessage = textParts.line1.replace(/<strong>|<\/strong>/g, '');
  if (textParts.line2Context) fullMessage += `\n${textParts.line2Context}`;
  if (textParts.line3ActionInstruction) fullMessage += `\n\nAção Sugerida: ${textParts.line3ActionInstruction}`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};