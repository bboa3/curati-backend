import { AppointmentParticipantType, NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
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
  const { recipientName, requesterName, requesterType } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const title = `${brandConfig.appName}: Confirmação Necessária`;
  let body: string;

  if (requesterType === AppointmentParticipantType.PATIENT) {
    body = `${recipientName}, ${requesterName} solicitou um agendamento. Por favor, confirme.`;
  } else {
    body = `${recipientName}, ${requesterName} propôs um novo agendamento. Reveja e confirme.`;
  }

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};