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
    professionalName,
    appointmentType,
  } = templateData;

  const title = "Profissional à Espera";
  const formattedType = convertAppointmentType(appointmentType);

  const shortMessage = `${professionalName.split(' ')[0]} aguarda! Toque para entrar na ${formattedType.toLowerCase()}.`;
  const fullMessage = `${professionalName} está à sua espera para iniciar a ${formattedType.toLowerCase()}. Por favor, entre agora.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};