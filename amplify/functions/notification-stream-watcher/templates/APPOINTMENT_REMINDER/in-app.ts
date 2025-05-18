import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { NotificationChannel } from "../../../helpers/types/schema";
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
    purpose,
  } = templateData;

  const title = "Lembrete de Agendamento";
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  const shortMessage = `Lembrete: ${formattedType} com ${otherPartyName.split(' ')[0]} ${formattedDateTime}.`;
  let fullMessage = `Lembrete para o seu ${formattedType.toLowerCase()} (${purpose}) com ${otherPartyName} ${formattedDateTime}.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};