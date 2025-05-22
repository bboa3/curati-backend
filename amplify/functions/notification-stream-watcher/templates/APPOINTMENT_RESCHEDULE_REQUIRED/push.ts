import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
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
  const { reschedulerName, newAppointmentDateTime } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const title = `${brandConfig.appName}: Agendamento Reagendado`;
  const formattedNewTime = formatDateTimeNumeric(newAppointmentDateTime);

  const body = `Seu agendamento foi reagendado por ${reschedulerName} para ${formattedNewTime}. Toque para ver.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};