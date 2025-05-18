import mjml2html from 'mjml';
import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, AppointmentType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { convertAppointmentType } from "../../helpers/enum/appointmentType";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const {
    recipientName,
    otherPartyName,
    recipientType,
    appointmentDateTime,
    appointmentType,
    purpose,
    reminderTimingText,
    locationName,
    additionalInstructions,
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const subject = `${brandConfig.appName}: Lembrete de Agendamento ${reminderTimingText ? `- ${reminderTimingText}` : ''}`;
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const currentYear = new Date().getFullYear();
  const appointmentDeepLink = payload.href ? payload.href : '';

  const meetingWithText = recipientType === AppointmentParticipantType.PATIENT ? `com ${otherPartyName}` : `com o(a) paciente ${otherPartyName}`;
  const preheaderText = `Lembrete: ${formattedType} ${meetingWithText} ${formattedDateTime}.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.PRIMARY2}" padding-bottom="15px">
    Lembrete de Agendamento
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="20px">
    Este é um lembrete amigável sobre o seu ${formattedType.toLowerCase()} para "${purpose}" ${meetingWithText}, agendado para <strong>${formattedDateTime}</strong>.
  </mj-text>

  ${locationName ? `<mj-text padding-bottom="5px" font-weight="bold" color="${brandConfig.colors.BLACK}">• Local:</mj-text><mj-text padding-bottom="15px">${locationName}</mj-text>` : ''}
  ${additionalInstructions ? `<mj-raw><div class="highlight-box" style="margin-top:0; margin-bottom:15px;"><mj-text color="${brandConfig.colors.PRIMARY}" font-style="italic">${additionalInstructions}</mj-text></div></mj-raw>` : ''}

  <mj-spacer height="20px" />

  <mj-text font-size="13px">
    ${appointmentType === AppointmentType.IN_PERSON ? 'Por favor, chegue com alguns minutos de antecedência.' : 'Prepare-se para a sua consulta online.'}
    Se precisar reagendar ou cancelar, aceda à aplicação o mais breve possível.
  </mj-text>

  <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;

  mjmlBody += generateEmailFooter({ brandConfig });

  const textBody = `
${brandConfig.appName}: Lembrete de Agendamento ${reminderTimingText ? `- ${reminderTimingText}` : ''}

Prezado(a) ${recipientName},

Este é um lembrete amigável sobre o seu ${formattedType.toLowerCase()} para "${purpose}" ${meetingWithText}, agendado para ${formattedDateTime}.
${locationName ? `\nLocal: ${locationName}` : ''}
${additionalInstructions ? `\nInstruções: ${additionalInstructions}` : ''}

Ver Detalhes: ${appointmentDeepLink}

${appointmentType === AppointmentType.IN_PERSON ? 'Por favor, chegue com alguns minutos de antecedência.' : 'Prepare-se para a sua consulta online.'}
Se precisar reagendar ou cancelar, aceda à aplicação o mais breve possível.

Atenciosamente,
Equipa ${brandConfig.appName}

---
Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.
${brandConfig.companyAddress}
Suporte: ${brandConfig.supportEmail}
`.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};