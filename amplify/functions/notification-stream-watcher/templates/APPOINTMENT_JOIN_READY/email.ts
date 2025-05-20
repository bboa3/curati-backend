import mjml2html from 'mjml';
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
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const subject = `${brandConfig.appName}: ${professionalName} está à sua espera!`;
  const formattedScheduledTime = formatTimeWithHourSuffix(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const currentYear = new Date().getFullYear();
  const joinVirtualCallDeepLink = payload.href ? payload.href : '';

  const preheaderText = `A sua ${formattedType.toLowerCase()} com ${professionalName} está pronta para começar.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.ORANGE}" padding-bottom="15px">
    O Seu Profissional Está à Espera!
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="20px">
    ${professionalName} iniciou a sua ${formattedType.toLowerCase()} (agendada para as ${formattedScheduledTime}) e está à sua espera para começar.
  </mj-text>
  
  ${generateEmailButton({
    text: `Entrar na ${formattedType}`,
    url: joinVirtualCallDeepLink,
    brandConfig,
    customBackgroundColor: brandConfig.colors.GREEN, // Strong positive action color
  })}
  <mj-spacer height="25px" />

  <mj-text font-size="13px">
    Por favor, clique no botão acima para aceder à sua consulta o mais breve possível.
  </mj-text>
  <mj-text font-size="13px" padding-top="10px">
    Se tiver dificuldades, contacte o nosso <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">suporte</a>.
  </mj-text>

  <mj-text padding-top="25px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;

  mjmlBody += generateEmailFooter({ brandConfig });

  const textBody = `
${brandConfig.appName}: ${professionalName} está à sua espera!

Prezado(a) ${recipientName},

${professionalName} iniciou a sua ${formattedType.toLowerCase()} (agendada para as ${formattedScheduledTime}) e está à sua espera para começar.

Entrar na ${formattedType}:
${joinVirtualCallDeepLink}

Por favor, aceda à sua consulta o mais breve possível.
Se tiver dificuldades, contacte o nosso suporte: ${brandConfig.supportEmail}

Atenciosamente,
Equipa ${brandConfig.appName}

---
Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.
${brandConfig.companyAddress}
`.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};