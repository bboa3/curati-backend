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
  const { otherPartyName, appointmentDateTime } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const title = `${brandConfig.appName}: Agendamento Cancelado`;
  const formattedDate = formatDateTimeNumeric(appointmentDateTime);

  const body = `Agendamento com ${otherPartyName} em ${formattedDate} foi cancelado. Toque para detalhes.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};