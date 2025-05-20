import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
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
    reschedulerName,
    newAppointmentDateTime,
    originalAppointmentDateTime,
    appointmentNumber
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const formattedNewDateTime = formatDateTimeNumeric(newAppointmentDateTime);
  const formattedOldDateTime = formatDateTimeNumeric(originalAppointmentDateTime);
  const appointmentDeepLink = payload.href ? payload.href : '';

  const body = `${header}Agend. #${appointmentNumber} REAGENDADO por ${reschedulerName.split(' ')[0]} para ${formattedNewDateTime} (antes ${formattedOldDateTime}). Detalhes: ${appointmentDeepLink}`;

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};