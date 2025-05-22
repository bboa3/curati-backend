import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, NotificationChannel } from "../../../helpers/types/schema";
import { convertAppointmentType } from "../../helpers/enum/appointmentType";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const {
    otherPartyName,
    appointmentDateTime,
    appointmentType,
    cancellationReason,
    recipientType,
  } = templateData;

  const title = "Agendamento Cancelado";
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  let shortMessage = `A sua consulta (${formattedType}) com ${otherPartyName} (${formattedDateTime}) foi cancelado.`;

  let fullMessage = `A sua consulta ${formattedType} com ${otherPartyName} para ${formattedDateTime} foi cancelado`;
  fullMessage += `.`;
  if (cancellationReason) {
    fullMessage += ` Motivo: ${cancellationReason}.`;
  }

  if (recipientType === AppointmentParticipantType.PATIENT) {
    fullMessage += ` Pode tentar reagendar ou contactar o suporte se necessário.`;
  } else {
    fullMessage += ` O horário correspondente na sua agenda foi libertado.`;
  }

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};