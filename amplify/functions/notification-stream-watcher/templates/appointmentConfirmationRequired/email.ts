import mjml2html from 'mjml';
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
    requesterName,
    requesterType,
    appointmentNumber,
    appointmentDateTime,
    duration,
    appointmentType,
    purpose,
  } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const subject = `Cúrati: Confirmação Necessária - Agendamento #${appointmentNumber}`;
  const currentYear = new Date().getFullYear();
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const appointmentDeepLink = payload.href ? payload.href : '';

  const requesterTypeText = requesterType === AppointmentParticipantType.PATIENT ? `pelo paciente ${requesterName}` : `pelo(a) ${requesterName}`;
  const introText = requesterType === AppointmentParticipantType.PATIENT
    ? `Um novo pedido de agendamento foi solicitado ${requesterTypeText} e aguarda a sua confirmação.`
    : `${requesterTypeText} propôs um novo agendamento para si através da plataforma Cúrati.`;

  const preheaderText = `Ação necessária: confirme o seu agendamento para ${formattedType}.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
    <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="15px">
      Confirmação de Agendamento Necessária
    </mj-text>
    <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
    <mj-text padding-bottom="20px">${introText}</mj-text>

    <mj-text font-size="18px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="10px">
      Detalhes do Agendamento Proposto:
    </mj-text>
    <mj-table padding="0px" cellpadding="5px">
      <tr style="border-bottom: 1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding: 8px 0; color: ${brandConfig.colors.BLACK2}; font-weight: bold; min-width:120px;">Propósito:</td>
        <td style="padding: 8px 0;">${purpose}</td>
      </tr>
      <tr style="border-bottom: 1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding: 8px 0; color: ${brandConfig.colors.BLACK2}; font-weight: bold;">${requesterType === AppointmentParticipantType.PATIENT ? 'Paciente:' : 'Profissional:'}</td>
        <td style="padding: 8px 0;">${requesterName}</td>
      </tr>
      <tr style="border-bottom: 1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding: 8px 0; color: ${brandConfig.colors.BLACK2}; font-weight: bold;">Data e Hora:</td>
        <td style="padding: 8px 0;">${formattedDateTime}</td>
      </tr>
      <tr style="border-bottom: 1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding: 8px 0; color: ${brandConfig.colors.BLACK2}; font-weight: bold;">Duração:</td>
        <td style="padding: 8px 0;">${duration} minutos</td>
      </tr>
      <tr style="border-bottom: 1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding: 8px 0; color: ${brandConfig.colors.BLACK2}; font-weight: bold;">Tipo:</td>
        <td style="padding: 8px 0;">${formattedType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${brandConfig.colors.BLACK2}; font-weight: bold;">Referência:</td>
        <td style="padding: 8px 0;">#${appointmentNumber}</td>
      </tr>
    </mj-table>

    <mj-spacer height="20px" />
    <mj-raw><div class="highlight-box"></mj-raw> <mj-text font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="5px">Ação Necessária:</mj-text>
      <mj-text color="${brandConfig.colors.PRIMARY}">
        Por favor, reveja os detalhes e confirme a sua disponibilidade ${requesterType === AppointmentParticipantType.PATIENT ? 'para este agendamento' : 'o mais breve possível'} através da aplicação Cúrati.
      </mj-text>
    <mj-raw></div></mj-raw>
    <mj-spacer height="10px" />

    <mj-text>A sua confirmação atempada é importante para garantir a reserva do horário.</mj-text>
    
    ${generateEmailButton({
    text: "Rever e Confirmar Agendamento",
    url: appointmentDeepLink,
    brandConfig,
  })}
    <mj-spacer height="20px" />

    <mj-text padding-top="25px">Atenciosamente,</mj-text>
    <mj-text font-weight="bold">Equipa ${brandConfig.appName}</mj-text>
  `;

  mjmlBody += generateEmailFooter({ brandConfig });

  const textBody = `
Confirmação de Agendamento Necessária - Cúrati

Prezado(a) ${recipientName},

${introText}

Detalhes do Agendamento Proposto:
- Propósito: ${purpose}
- ${requesterType === AppointmentParticipantType.PATIENT ? 'Paciente:' : 'Profissional:'} ${requesterName}
- Data e Hora: ${formattedDateTime}
- Duração: ${duration} minutos
- Tipo: ${formattedType}
- Referência: #${appointmentNumber}

AÇÃO NECESSÁRIA:
Por favor, reveja os detalhes e confirme a sua disponibilidade ${requesterType === AppointmentParticipantType.PATIENT ? 'para este agendamento' : 'o mais breve possível'} através da aplicação Cúrati.
A sua confirmação atempada é importante para garantir a reserva do horário.

Rever e Confirmar Agendamento:
${appointmentDeepLink}

Atenciosamente,
Equipa ${brandConfig.appName}

---
Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.
${brandConfig.companyAddress}
Para suporte, contacte: ${brandConfig.supportEmail}
Termos: ${brandConfig.termsUrl} | Privacidade: ${brandConfig.privacyPolicyUrl}
  `.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};