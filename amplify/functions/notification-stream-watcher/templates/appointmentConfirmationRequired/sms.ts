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
    appointmentDateTime,
    requesterName,
    requesterType,
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const appointmentDeepLink = payload.href ? payload.href : '';

  let body: string;
  if (requesterType === AppointmentParticipantType.PATIENT) {
    body = `${header}Novo agendamento de ${requesterName} (${formattedDateTime}) aguarda sua confirmação. Detalhes e confirmar: ${appointmentDeepLink}`;
  } else {
    body = `${header}${requesterName} propôs agendamento (${formattedDateTime}). Confirme sua disponibilidade. Detalhes: ${appointmentDeepLink}`;
  }

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};