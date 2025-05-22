import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';
import { getAppointmentReminderTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const appNameToUse = templateData.recipientType === AppointmentParticipantType.PROFESSIONAL ? "Cúrati Rx" : "Cúrati";
  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href ? payload.href : '';
  const textParts = getAppointmentReminderTextParts(templateData, brandConfig.appName);

  let coreMessage = `Lembrete Agend. (${templateData.purpose.substring(0, 10)}...)  ${templateData.reminderTimingText} ${formatDateTimeNumeric(templateData.appointmentDateTime)}.`;
  if (textParts.line3ActionInstruction && textParts.line3ActionInstruction.length < 40) {
    coreMessage += ` ${textParts.line3ActionInstruction.split('.')[0]}.`;
  }

  const body = `${header}${coreMessage} Detalhes: ${deepLink}`.substring(0, 160);

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};