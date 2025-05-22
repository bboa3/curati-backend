import { formatTimeWithHourSuffix } from "../../../helpers/date/formatter";
import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
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
    professionalName,
    appointmentDateTime,
    appointmentType,
  } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const subject = `${brandConfig.appName}: ${professionalName} está à sua espera!`;
  const formattedTime = formatTimeWithHourSuffix(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType).toLowerCase();
  const link = payload.href || '';
  const preheaderText = `A sua ${formattedType} com ${professionalName} está pronta para começar.`;

  let html = generateEmailHeader({ brandConfig, preheaderText });

  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.ORANGE};">
      O Seu Profissional Está à Espera!
    </h2>
    <p style="margin:0 0 10px;">
      Prezado(a) ${recipientName},
    </p>
    <p style="margin:0 0 20px;">
      ${professionalName} iniciou a sua ${formattedType} (agendada para as ${formattedTime}) e está à sua espera para começar.
    </p>
    ${generateEmailButton({
    text: `Entrar na ${formattedType.charAt(0).toUpperCase() + formattedType.slice(1)}`,
    url: link,
    brandConfig,
    customBackgroundColor: brandConfig.colors.GREEN,
  })}
    <div style="height:25px;"></div>
    <p style="font-size:13px;margin:0 0 5px;">
      Por favor, clique no botão acima para aceder à sua consulta o mais breve possível.
    </p>
    <p style="font-size:13px;margin:0 0 20px;">
      Se tiver dificuldades, contacte o nosso
      <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};text-decoration:none;">
        suporte
      </a>.
    </p>
    <p style="margin:0 0 20px;">Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig });

  const textBody = `
${subject}

Prezado(a) ${recipientName},

${professionalName} iniciou a sua ${formattedType} (agendada para as ${formattedTime}) e está à sua espera para começar.

Entrar na ${formattedType.charAt(0).toUpperCase() + formattedType.slice(1)}:
${link}

Por favor, aceda à sua consulta o mais breve possível.
Se tiver dificuldades, contacte o nosso suporte: ${brandConfig.supportEmail}

Atenciosamente,
Equipa ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${new Date().getFullYear()} ${brandConfig.appNameLegal}.
${brandConfig.companyAddress}
`.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: html,
    textBody,
  };
};