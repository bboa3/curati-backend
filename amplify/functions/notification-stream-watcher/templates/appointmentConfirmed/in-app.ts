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
    recipientType,
    appointmentDateTime,
    appointmentType,
    purpose,
  } = templateData;

  const title = "Agendamento Confirmado";
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const meetingWithText = recipientType === AppointmentParticipantType.PATIENT ? `com ${otherPartyName}` : `com o(a) paciente ${otherPartyName}`;

  const shortMessage = `${formattedType} ${meetingWithText} em ${formattedDateTime}.`;
  let fullMessage = `Confirmado: ${formattedType} ${meetingWithText} sobre "${purpose}" para ${formattedDateTime}.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};