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
    otherPartyName,
    recipientType,
    appointmentNumber,
    appointmentDateTime,
    appointmentType,
    purpose,
  } = templateData;
  const appName = recipientType === AppointmentParticipantType.PROFESSIONAL ? 'Cúrati RX' : 'Cúrati';

  const brandConfig = getDefaultBrandConfig({ appName });
  const subject = `${brandConfig.appName}: Agendamento #${appointmentNumber} Confirmado!`;
  const currentYear = new Date().getFullYear();
  const formattedDateTime = formatDateTimeNumeric(new Date(appointmentDateTime));
  const formattedType = convertAppointmentType(appointmentType);
  const appointmentDeepLink = payload.href || '';

  const meetingWithText =
    recipientType === AppointmentParticipantType.PATIENT
      ? `com ${otherPartyName}`
      : `com o(a) paciente ${otherPartyName}`;
  const preheaderText =
    `O seu agendamento ${meetingWithText} para ${formattedDateTime} está confirmado.`;

  let html = generateEmailHeader({ brandConfig, preheaderText });

  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.PRIMARY};">
      Agendamento Confirmado!
    </h2>
    <p style="margin:0 0 10px;">Prezado(a) ${recipientName},</p>
    <p style="margin:0 0 20px;">
      O seu agendamento ${meetingWithText} para "${purpose}" foi confirmado com sucesso.
    </p>

    <p style="
      font-size:16px;
      font-weight:bold;
      color:${brandConfig.colors.BLACK};
      margin:0 0 10px;
    ">
      Detalhes Confirmados:
    </p>
    <ul style="
      padding-left:20px;
      margin:0 0 20px;
      font-family:'Segoe UI',sans-serif;
      font-size:14px;
      color:${brandConfig.colors.BLACK};
    ">
      <li style="margin-bottom:8px;"><strong>Tipo:</strong> ${formattedType}</li>
      <li style="margin-bottom:8px;"><strong>Data:</strong> ${formattedDateTime}</li>
      <li><strong>Com:</strong> ${otherPartyName}</li>
    </ul>

    ${generateEmailButton({
    text: 'Ver Detalhes na App',
    url: appointmentDeepLink,
    brandConfig,
  })}

    <div style="height:20px;"></div>
    <p style="font-size:13px;">Por favor, anote na sua agenda. Se precisar reagendar ou cancelar, utilize a aplicação com antecedência.</p>
    <p style="margin:0;padding-top:20px;">Obrigado,<br/>Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig });

  let textBody = `
${subject}

Prezado(a) ${recipientName},

O seu agendamento ${meetingWithText} para "${purpose}" foi confirmado com sucesso.

Detalhes Confirmados:
- Tipo: ${formattedType}
- Data: ${formattedDateTime}
- Com: ${otherPartyName}

Ver Detalhes na App: ${appointmentDeepLink}

Por favor, anote na sua agenda. Se precisar reagendar ou cancelar, utilize a aplicação com antecedência.

Obrigado,
Equipa ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.
${brandConfig.companyAddress}
Suporte: ${brandConfig.supportEmail}
`.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: html,
    textBody,
  };
};