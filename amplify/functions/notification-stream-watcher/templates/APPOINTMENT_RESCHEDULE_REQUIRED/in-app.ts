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
    reschedulerName,
    newAppointmentDateTime,
    originalAppointmentDateTime,
    appointmentType,
  } = templateData;

  const title = "Agendamento Reagendado";
  const formattedNewDateTime = formatDateTimeNumeric(newAppointmentDateTime);
  const formattedOldDateTime = formatDateTimeNumeric(originalAppointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  const shortMessage = `${formattedType} reagendado por ${reschedulerName.split(' ')[0]} para ${formattedNewDateTime}.`;
  const fullMessage = `Seu ${formattedType} com ${reschedulerName} foi reagendado de ${formattedOldDateTime} para ${formattedNewDateTime}.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};