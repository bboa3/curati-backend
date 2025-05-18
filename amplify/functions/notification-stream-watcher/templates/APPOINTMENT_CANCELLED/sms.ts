import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload;
}

export const generateSmsMessage = ({ channel, templateData }: TemplateInput): SmsMessage => {
  const {
    appointmentDateTime,
    appointmentNumber,
    recipientType,
    newAppointmentDeepLink
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const formattedDate = formatDateTimeNumeric(appointmentDateTime);

  let body = `${header}Agend. #${appointmentNumber} de ${formattedDate} CANCELADO`;
  body += `.`;

  if (recipientType === AppointmentParticipantType.PATIENT && newAppointmentDeepLink) {
    body += ` Para reagendar: ${newAppointmentDeepLink}`;
  } else {
    body += ` Veja detalhes na app.`;
  }
  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};