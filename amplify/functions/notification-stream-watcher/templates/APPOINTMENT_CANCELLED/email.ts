import { formatDateTimeNumeric } from '../../../helpers/date/formatter';
import {
  AppointmentParticipantType,
  NotificationChannel,
  NotificationPayload,
} from '../../../helpers/types/schema';
import { convertAppointmentType } from '../../helpers/enum/appointmentType';
import { EmailMessage } from '../../helpers/types';
import { getDefaultBrandConfig } from '../shared/brand.config';
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from '../shared/footer';
import { generateEmailHeader } from '../shared/header';
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
}

export const generateEmailMessage = ({
  channel,
  templateData,
  payload,
}: TemplateInput): EmailMessage => {
  const {
    recipientName,
    otherPartyName,
    recipientType,
    appointmentNumber,
    appointmentDateTime,
    appointmentType,
    purpose,
    cancellationReason,
    newAppointmentDeepLink,
  } = templateData;
  const appName = recipientType === AppointmentParticipantType.PROFESSIONAL ? 'Cúrati RX' : 'Cúrati';

  const brandConfig = getDefaultBrandConfig({ appName });
  const subject = `${brandConfig.appName}: Agendamento #${appointmentNumber} Cancelado`;
  const formattedDateTime = formatDateTimeNumeric(
    new Date(appointmentDateTime)
  );
  const formattedType = convertAppointmentType(appointmentType);
  const currentYear = new Date().getFullYear();

  // preheader for inbox preview
  const preheaderText = `Seu ${formattedType} em ${formattedDateTime} foi cancelado.`;

  // start HTML
  let html = generateEmailHeader({ brandConfig, preheaderText });

  // Title & intro
  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.RED};">
      Agendamento Cancelado
    </h2>
    <p style="margin:0 0 10px;">
      Prezado(a) ${recipientName},
    </p>
    <p style="margin:0 0 10px;">
      Lamentamos informar que o seu agendamento #${appointmentNumber}
      (${formattedType} – “${purpose}”) com ${otherPartyName},
      marcado para ${formattedDateTime}, foi cancelado.
    </p>
    ${cancellationReason
      ? `<p style="
            margin:0 0 20px;
            font-style:italic;
            color:${brandConfig.colors.BLACK2};
          ">
            <strong>Motivo do Cancelamento:</strong> ${cancellationReason}
          </p>`
      : `<div style="height:10px;"></div>`
    }
    <p style="
      font-size:16px;
      font-weight:bold;
      margin:0 0 10px;
      color:${brandConfig.colors.BLACK};
    ">
      O que pode fazer:
    </p>
  `;

  // Patient view
  if (recipientType === AppointmentParticipantType.PATIENT) {
    html += `
      <ul style="
        padding-left:20px;
        margin:0 0 10px;
        font-family:'Segoe UI',sans-serif;
        font-size:14px;
        color:${brandConfig.colors.BLACK};
      ">
        <li style="margin-bottom:8px;">
          Tentar agendar uma nova consulta.
        </li>
      </ul>
    `;
    if (newAppointmentDeepLink) {
      html += generateEmailButton({
        text: 'Agendar Nova Consulta',
        url: newAppointmentDeepLink,
        brandConfig,
      });
    }
    html += `
      <p style="margin:10px 0;font-size:14px;">
        Para dúvidas ou assistência, contacte o nosso suporte.
      </p>
    `;
  } else {
    // Provider / other party view
    html += `
      <ul style="
        padding-left:20px;
        margin:0 0 10px;
        font-family:'Segoe UI',sans-serif;
        font-size:14px;
        color:${brandConfig.colors.BLACK};
      ">
        <li style="margin-bottom:8px;">
          O horário foi libertado na sua agenda.
        </li>
        <li>
          Pode contactar o(a) paciente ${recipientName} na plataforma.
        </li>
      </ul>
      ${generateEmailButton({
      text: 'Ver Detalhes na App',
      url: payload.href || '',
      brandConfig,
      customBackgroundColor: brandConfig.colors.BLACK3,
      customTextColor: brandConfig.colors.BLACK,
    })}
    `;
  }

  // Closing
  html += `
    <div style="height:20px;"></div>
    <p style="margin:0 0 10px;">
      Lamentamos qualquer inconveniente que isto possa causar.
    </p>
    <p style="margin:0;">
      Atenciosamente,<br/>Equipa ${brandConfig.appName}
    </p>
  `;

  html += generateEmailFooter({ brandConfig });

  // Plain-text fallback
  let textBody = `
${subject}

Prezado(a) ${recipientName},

Lamentamos informar que o seu agendamento #${appointmentNumber}
(${formattedType} – “${purpose}”) com ${otherPartyName}, marcado para ${formattedDateTime}, foi cancelado.
`.trim();

  if (cancellationReason) {
    textBody += `

Motivo do Cancelamento: ${cancellationReason}
`;
  }

  textBody += `

O que pode fazer:
`;

  if (recipientType === AppointmentParticipantType.PATIENT) {
    textBody += `- Tentar agendar uma nova consulta${newAppointmentDeepLink ? `: ${newAppointmentDeepLink}` : '.'}
- Para dúvidas ou assistência, contacte nosso suporte: ${brandConfig.supportEmail}
`;
  } else {
    textBody += `- O horário foi libertado na sua agenda.
- Pode contactar o(a) paciente ${recipientName} na plataforma.
- Ver detalhes: ${payload.href || ''}
`;
  }

  textBody += `

Lamentamos qualquer inconveniente.

Atenciosamente,
Equipa ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.
${brandConfig.companyAddress}
Suporte: ${brandConfig.supportEmail}
`;

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: html,
    textBody: textBody.trim(),
  };
};
