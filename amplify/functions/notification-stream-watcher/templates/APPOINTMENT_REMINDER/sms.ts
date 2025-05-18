import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { convertAppointmentType } from "../../helpers/enum/appointmentType";
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
    appointmentDateTime,
    appointmentType,
    reminderTimingText
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const appointmentDeepLink = payload.href ? payload.href : '';

  let body = `${header}Lembrete: ${formattedType} ${reminderTimingText || formattedDateTime}. `;
  body += `Detalhes: ${appointmentDeepLink}`;
  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};