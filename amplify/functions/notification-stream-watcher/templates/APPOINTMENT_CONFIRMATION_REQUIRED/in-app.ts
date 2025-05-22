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
    requesterName,
    requesterType,
    appointmentDateTime,
    appointmentType,
    purpose,
  } = templateData;

  const title = "Confirmação de Agendamento Necessária";
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  let messageLine1: string;
  let messageLine2 = `Detalhes: ${formattedType} sobre "${purpose}" em ${formattedDateTime}.`;

  if (requesterType === AppointmentParticipantType.PATIENT) {
    messageLine1 = `${requesterName} (paciente) solicitou um novo agendamento que requer a sua confirmação.`;
  } else {
    messageLine1 = `${requesterName} (profissional) propôs um novo agendamento. Por favor, reveja e confirme a sua disponibilidade.`;
  }

  const fullMessage = `${messageLine1}\n${messageLine2}`;
  const shortMessage = `Ação: Confirmar agendamento com ${requesterName}.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};