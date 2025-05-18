import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
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
  const { otherPartyName, recipientType, appointmentDateTime, appointmentType } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  const title = `${brandConfig.appName}: Agendamento Confirmado!`;
  const meetingWithText = recipientType === AppointmentParticipantType.PATIENT ? `c/ ${otherPartyName.split(' ')[0]}` : `c/ ${otherPartyName}`;

  const body = `${formattedType} ${meetingWithText} ${formattedDateTime}.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};