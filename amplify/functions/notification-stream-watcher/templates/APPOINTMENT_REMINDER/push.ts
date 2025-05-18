import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { convertAppointmentType } from "../../helpers/enum/appointmentType";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const { otherPartyName, appointmentDateTime, appointmentType, reminderTimingText } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const title = `${brandConfig.appName}: Lembrete de Agendamento`;
  const formattedTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  const body = `${formattedType} com ${otherPartyName.split(' ')[0]} ${reminderTimingText || ''} às ${formattedTime}. Toque para detalhes.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};