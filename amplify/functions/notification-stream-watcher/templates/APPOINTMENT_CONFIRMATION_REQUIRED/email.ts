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
    requesterName,
    requesterType,
    appointmentNumber,
    appointmentDateTime,
    duration,
    appointmentType,
    purpose,
  } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const subject = `Cúrati: Confirmação Necessária - Agendamento #${appointmentNumber}`;
  const currentYear = new Date().getFullYear();
  const formattedDateTime = formatDateTimeNumeric(
    new Date(appointmentDateTime)
  );
  const formattedType = convertAppointmentType(appointmentType);
  const appointmentDeepLink = payload.href || '';

  // Intro text varies by who requested
  const requesterTypeText =
    requesterType === AppointmentParticipantType.PATIENT
      ? `pelo paciente ${requesterName}`
      : `pelo(a) ${requesterName}`;
  const introText =
    requesterType === AppointmentParticipantType.PATIENT
      ? `Um novo pedido de agendamento foi solicitado ${requesterTypeText} e aguarda a sua confirmação.`
      : `${requesterTypeText} propôs um novo agendamento para si através da plataforma Cúrati.`;

  const preheaderText = `Confirme seu agendamento de ${formattedType} para ${formattedDateTime}.`;

  // start HTML
  let html = generateEmailHeader({ brandConfig, preheaderText });

  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.PRIMARY};">
      Confirmação de Agendamento Necessária
    </h2>
    <p style="margin:0 0 10px;">
      Prezado(a) ${recipientName},
    </p>
    <p style="margin:0 0 20px;">
      ${introText}
    </p>

    <p style="
      font-size:18px;
      font-weight:bold;
      color:${brandConfig.colors.BLACK};
      margin:0 0 10px;
    ">
      Detalhes do Agendamento Proposto:
    </p>
    <table width="100%" cellpadding="5" cellspacing="0" role="presentation"
           style="border-collapse:collapse;margin:0 0 20px;">
      <tr style="border-bottom:1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding:8px 0;color:${brandConfig.colors.BLACK2};font-weight:bold;min-width:120px;">
          Propósito:
        </td>
        <td style="padding:8px 0;">${purpose}</td>
      </tr>
      <tr style="border-bottom:1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding:8px 0;color:${brandConfig.colors.BLACK2};font-weight:bold;">
          ${requesterType === AppointmentParticipantType.PATIENT ? 'Paciente:' : 'Profissional:'}
        </td>
        <td style="padding:8px 0;">${requesterName}</td>
      </tr>
      <tr style="border-bottom:1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding:8px 0;color:${brandConfig.colors.BLACK2};font-weight:bold;">
          Data e Hora:
        </td>
        <td style="padding:8px 0;">${formattedDateTime}</td>
      </tr>
      <tr style="border-bottom:1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding:8px 0;color:${brandConfig.colors.BLACK2};font-weight:bold;">
          Duração:
        </td>
        <td style="padding:8px 0;">${duration} minutos</td>
      </tr>
      <tr style="border-bottom:1px solid ${brandConfig.colors.BLACK4};">
        <td style="padding:8px 0;color:${brandConfig.colors.BLACK2};font-weight:bold;">
          Tipo:
        </td>
        <td style="padding:8px 0;">${formattedType}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:${brandConfig.colors.BLACK2};font-weight:bold;">
          Referência:
        </td>
        <td style="padding:8px 0;">#${appointmentNumber}</td>
      </tr>
    </table>

    <div style="
      border-left:5px solid ${brandConfig.colors.PRIMARY};
      background:${brandConfig.colors.PRIMARY4};
      padding:10px 15px;
      border-radius:4px;
      margin:0 0 10px;
    ">
      <p style="
        margin:0 0 5px;
        font-weight:bold;
        color:${brandConfig.colors.PRIMARY};
      ">
        Ação Necessária:
      </p>
      <p style="margin:0;color:${brandConfig.colors.PRIMARY};">
        Por favor, reveja os detalhes e confirme a sua disponibilidade ${requesterType === AppointmentParticipantType.PATIENT
      ? 'para este agendamento'
      : 'o mais breve possível'
    } através da aplicação Cúrati.
      </p>
    </div>

    <p style="margin:0 0 20px;">
      A sua confirmação atempada é importante para garantir a reserva do horário.
    </p>

    ${generateEmailButton({
      text: 'Rever e Confirmar Agendamento',
      url: appointmentDeepLink,
      brandConfig,
    })}

    <div style="height:20px;"></div>
    <p style="margin:0 0 5px;">Atenciosamente,</p>
    <p style="margin:0;font-weight:bold;">Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig });

  // plain-text fallback
  let textBody = `
${subject}

Prezado(a) ${recipientName},

${introText}

Detalhes do Agendamento Proposto:
- Propósito: ${purpose}
- ${requesterType === AppointmentParticipantType.PATIENT
      ? 'Paciente'
      : 'Profissional'
    }: ${requesterName}
- Data e Hora: ${formattedDateTime}
- Duração: ${duration} minutos
- Tipo: ${formattedType}
- Referência: #${appointmentNumber}

AÇÃO NECESSÁRIA:
Por favor, reveja os detalhes e confirme a sua disponibilidade ${requesterType === AppointmentParticipantType.PATIENT
      ? 'para este agendamento'
      : 'o mais breve possível'
    } através da aplicação Cúrati.

A sua confirmação atempada é importante para garantir a reserva do horário.

Rever e Confirmar Agendamento: ${appointmentDeepLink}

Atenciosamente,
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
