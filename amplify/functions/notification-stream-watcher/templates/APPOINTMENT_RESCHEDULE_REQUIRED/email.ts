import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { AppointmentParticipantType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { convertAppointmentType } from "../../helpers/enum/appointmentType";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from "../shared/buttons";
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
    reschedulerName,
    reschedulerType,
    appointmentNumber,
    originalAppointmentDateTime,
    newAppointmentDateTime,
    appointmentType,
    purpose,
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const subject = `${brandConfig.appName}: Agendamento #${appointmentNumber} Reagendado`;
  const formattedOriginalDateTime = formatDateTimeNumeric(originalAppointmentDateTime);
  const formattedNewDateTime = formatDateTimeNumeric(newAppointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const appointmentDeepLink = payload.href ? payload.href : '';
  const currentYear = new Date().getFullYear();

  const reschedulerRoleText = reschedulerType === AppointmentParticipantType.PATIENT ? "O paciente" : "O(A) profissional";
  const preheaderText = `O seu agendamento para ${formattedType} foi reagendado para ${formattedNewDateTime}.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.ORANGE}" padding-bottom="15px">
    Agendamento Reagendado
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="20px">
    Informamos que o seu agendamento para "${purpose}" ${reschedulerType === AppointmentParticipantType.PATIENT ? `com o(a) paciente ${reschedulerName}` : `com ${reschedulerName} foi reagendado.`}.
  </mj-text>

  <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">
    Novos Detalhes do Agendamento:
  </mj-text>
  <mj-text padding-bottom="5px" color="${brandConfig.colors.GREEN}">• <strong>Nova Data e Hora: ${formattedNewDateTime}</strong></mj-text>
  <mj-text padding-bottom="5px" color="${brandConfig.colors.RED}" font-size="13px" font-style="italic"><strike>• Data Original: ${formattedOriginalDateTime}</strike></mj-text>
  <mj-text padding-bottom="5px">• <strong>Tipo:</strong> ${formattedType}</mj-text>
  <mj-text padding-bottom="15px">• <strong>Com:</strong> ${reschedulerName}</mj-text>
  
  ${generateEmailButton({
    text: "Ver Detalhes Atualizados",
    url: appointmentDeepLink,
    brandConfig,
    customBackgroundColor: brandConfig.colors.ORANGE2,
    customTextColor: brandConfig.colors.BLACK,
  })}
  <mj-spacer height="20px" />

  <mj-text font-size="13px">
    Por favor, atualize a sua agenda. Se tiver alguma questão, contacte-nos através da aplicação.
  </mj-text>

  <mj-text padding-top="20px">Obrigado,<br />Equipa ${brandConfig.appName}</mj-text>
`;

  mjmlBody += generateEmailFooter({ brandConfig });

  const textBody = `
${brandConfig.appName}: Agendamento #${appointmentNumber} Reagendado

Prezado(a) ${recipientName},

Informamos que o seu agendamento para "${purpose}" ${reschedulerType === AppointmentParticipantType.PATIENT ? `com o(a) paciente ${reschedulerName}` : `com ${reschedulerName}`} foi reagendado por ${reschedulerName.toLowerCase() === recipientName.toLowerCase() ? 'si' : `${reschedulerRoleText.toLowerCase()} ${reschedulerName}`}.
Novos Detalhes:
- Nova Data e Hora: ${formattedNewDateTime}
- (Data Original: ${formattedOriginalDateTime})
- Tipo: ${formattedType}
- Com: ${reschedulerName}

Ver Detalhes Atualizados:
${appointmentDeepLink}

Por favor, atualize a sua agenda.

Obrigado,
Equipa ${brandConfig.appName}

---
Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.
${brandConfig.companyAddress}
Suporte: ${brandConfig.supportEmail}
`.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: mjmlBody,
    textBody,
  };
};