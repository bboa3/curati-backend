import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const {
    otherPartyName,
    recipientType,
    appointmentDateTime,
    appointmentNumber
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const appointmentDeepLink = payload.href ? payload.href : '';
  const meetingWithText = recipientType === AppointmentParticipantType.PATIENT ? `com ${otherPartyName}` : `com paciente ${otherPartyName.split(' ')[0]}`;

  const body = `${header}Agend. #${appointmentNumber} CONFIRMADO ${meetingWithText} para ${formattedDateTime}. Detalhes: ${appointmentDeepLink}`;

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};