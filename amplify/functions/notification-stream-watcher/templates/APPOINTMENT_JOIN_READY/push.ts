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
  const { professionalName, appointmentType } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const title = `${brandConfig.appName}: Profissional à Espera!`;
  const formattedType = convertAppointmentType(appointmentType);

  const body = `${professionalName} aguarda por si para a ${formattedType.toLowerCase()}. Toque para entrar.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};