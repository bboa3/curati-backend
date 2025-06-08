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
  const appName = reschedulerType === AppointmentParticipantType.PROFESSIONAL ? 'Cúrati' : 'Cúrati RX';

  const brandConfig = getDefaultBrandConfig({ appName });
  const subject = `${brandConfig.appName}: Agendamento #${appointmentNumber} Reagendado`;
  const original = formatDateTimeNumeric(originalAppointmentDateTime);
  const updated = formatDateTimeNumeric(newAppointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const link = payload.href || '';
  const preheaderText = `O seu ${formattedType.toLowerCase()} foi reagendado para ${updated}.`;

  let html = generateEmailHeader({ brandConfig, preheaderText });

  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.ORANGE};">
      Agendamento Reagendado
    </h2>
    <p style="margin:0 0 10px;">
      Prezado(a) ${recipientName},
    </p>
    <p style="margin:0 0 20px;">
      Informamos que o seu agendamento para “${purpose}” ${reschedulerType === AppointmentParticipantType.PATIENT
      ? `com o(a) paciente ${reschedulerName}`
      : `com ${reschedulerName}`
    } foi reagendado.
    </p>
    <ul style="
      padding-left:20px;
      margin:0 0 20px;
      font-family:'Segoe UI',sans-serif;
      font-size:14px;
      color:${brandConfig.colors.BLACK};
    ">
      <li style="margin-bottom:8px;color:${brandConfig.colors.GREEN};">
        <strong>Nova Data e Hora:</strong> ${updated}
      </li>
      <li style="margin-bottom:8px;color:${brandConfig.colors.RED};font-style:italic;">
        <strike>Data Original: ${original}</strike>
      </li>
      <li style="margin-bottom:8px;">
        <strong>Tipo:</strong> ${formattedType}
      </li>
      <li>
        <strong>Com:</strong> ${reschedulerName}
      </li>
    </ul>
    ${generateEmailButton({
      text: 'Ver Detalhes Atualizados',
      url: link,
      brandConfig,
      customBackgroundColor: brandConfig.colors.ORANGE2,
      customTextColor: brandConfig.colors.BLACK,
    })}
    <div style="height:20px;"></div>
    <p style="font-size:13px;margin:0 0 5px;">
      Por favor, atualize a sua agenda. Se tiver alguma questão, contacte-nos através da aplicação.
    </p>
    <p style="margin:0;">Obrigado,<br/>Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig });

  const textBody = `
${subject}

Prezado(a) ${recipientName},

Informamos que o seu agendamento para “${purpose}” ${reschedulerType === AppointmentParticipantType.PATIENT
      ? `com o(a) paciente ${reschedulerName}`
      : `com ${reschedulerName}`
    } foi reagendado.

Novos Detalhes:
- Nova Data e Hora: ${updated}
- (Data Original: ${original})
- Tipo: ${formattedType}
- Com: ${reschedulerName}

Ver Detalhes Atualizados:
${link}

Por favor, atualize a sua agenda. Se tiver alguma questão, contacte-nos através da aplicação.

Obrigado,
Equipa ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${new Date().getFullYear()} ${brandConfig.appNameLegal}.
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
