import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, AppointmentType } from "../../../helpers/types/schema";
import { convertAppointmentType } from "../../helpers/enum/appointmentType";
import { TemplateData } from "./schema";

export interface AppointmentReminderTextParts {
  subject: string;
  emailTitle: string;
  title: string;
  greeting: string;
  line1: string;
  line2Context?: string;
  line3ActionInstruction?: string;
  buttonText: string;
  isImminent?: boolean;
}

export const getAppointmentReminderTextParts = (data: TemplateData, appName: string): AppointmentReminderTextParts => {
  const appointmentDateTime = formatDateTimeNumeric(data.appointmentDateTime);
  const appointmentTypeFullText = convertAppointmentType(data.appointmentType);

  const otherPartyContext = data.recipientType === AppointmentParticipantType.PATIENT ? `com ${data.otherPartyName}` : `com o(a) paciente ${data.otherPartyName}`;

  let eventTimeDescription = "";
  if (data.reminderTimingText.toLowerCase().includes("amanhã")) {
    eventTimeDescription = `amanhã, ${appointmentDateTime}`;
  } else if (data.reminderTimingText.toLowerCase().includes("hoje")) {
    eventTimeDescription = `hoje, ${appointmentDateTime}`;
  } else if (data.reminderTimingText) {
    eventTimeDescription = `${data.reminderTimingText}`;
  } else {
    eventTimeDescription = `${appointmentDateTime}`;
  }

  const isImminent = data.reminderTimingText.toLowerCase().includes("hora") || data.reminderTimingText.toLowerCase().includes("minutos");

  return {
    subject: `${appName}: Lembrete - Agendamento ${data.reminderTimingText}`,
    emailTitle: `Lembrete: Agendamento ${data.reminderTimingText}`,
    title: `Lembrete: ${appointmentTypeFullText}`,
    greeting: `Prezado(a) ${data.recipientName},`,
    line1: `Lembrete: A sua ${appointmentTypeFullText.toLowerCase()} (${data.purpose}) ${otherPartyContext} está agendada para ${eventTimeDescription}.`,
    line2Context: data.locationName ? `Local: ${data.locationName}.` : (data.appointmentType !== AppointmentType.IN_PERSON ? 'Esta é uma consulta virtual.' : undefined),
    line3ActionInstruction: data.specificActionInstruction,
    buttonText: (data.appointmentType !== AppointmentType.IN_PERSON && isImminent) ? `Entrar na ${appointmentTypeFullText}` : "Ver Detalhes",
    isImminent,
  };
};