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
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
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
    cancellationReason,
    newAppointmentDeepLink
  } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const subject = `${brandConfig.appName}: Agendamento #${appointmentNumber} Cancelado`;
  const formattedDateTime = formatDateTimeNumeric(new Date(appointmentDateTime));
  const formattedType = convertAppointmentType(appointmentType);
  const currentYear = new Date().getFullYear();
  const appointmentDeepLink = payload.href ? payload.href : '';

  const preheaderText = `O seu agendamento de ${formattedType} para ${formattedDateTime} foi cancelado.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.RED}" padding-bottom="15px">
    Agendamento Cancelado
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="10px">
    Lamentamos informar que o seu agendamento #${appointmentNumber} (${formattedType} para "${purpose}") com ${otherPartyName},
    anteriormente marcado para ${formattedDateTime}, foi cancelado.
  </mj-text>
  ${cancellationReason ? `<mj-text padding-bottom="20px" font-style="italic" color="${brandConfig.colors.BLACK2}"><strong>Motivo do Cancelamento:</strong> ${cancellationReason}</mj-text>` : '<mj-spacer height="10px" />'}

  <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">
    O que pode fazer:
  </mj-text>`;

  if (recipientType === AppointmentParticipantType.PATIENT) {
    mjmlBody += `<mj-text padding-bottom="10px">• Se desejar, pode tentar agendar uma nova consulta.</mj-text>`;
    if (newAppointmentDeepLink) {
      mjmlBody += generateEmailButton({
        text: "Agendar Nova Consulta",
        url: newAppointmentDeepLink,
        brandConfig,
        customBackgroundColor: brandConfig.colors.PRIMARY,
      });
    }
    mjmlBody += `<mj-text padding-top="10px" padding-bottom="10px">• Se tiver alguma questão ou precisar de assistência, por favor, contacte o nosso suporte .</mj-text>`;
  } else {
    mjmlBody += `
    <mj-text padding-bottom="10px">• O horário correspondente na sua agenda foi libertado.</mj-text>
    <mj-text padding-bottom="10px">• Pode contactar o(a) paciente ${recipientName} através da plataforma, se necessário.</mj-text>
    ${generateEmailButton({
      text: "Ver Detalhes na App",
      url: appointmentDeepLink,
      brandConfig,
      customBackgroundColor: brandConfig.colors.BLACK3,
      customTextColor: brandConfig.colors.BLACK,
    })}
  `;
  }

  mjmlBody += `
  <mj-spacer height="20px" />
  <mj-text padding-top="20px">Lamentamos qualquer inconveniente que isto possa causar.</mj-text>
  <mj-text padding-top="10px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;

  mjmlBody += generateEmailFooter({ brandConfig });

  const textBody = `
${brandConfig.appName}: Agendamento #${appointmentNumber} Cancelado

Prezado(a) ${recipientName},

Lamentamos informar que o seu agendamento #${appointmentNumber} (${formattedType} para "${purpose}") com ${otherPartyName}, anteriormente marcado para ${formattedDateTime}, foi cancelado.
${cancellationReason ? `Motivo: ${cancellationReason}\n` : ''}
O que pode fazer:
${recipientType === AppointmentParticipantType.PATIENT ?
      `- Se desejar, pode tentar agendar uma nova consulta${newAppointmentDeepLink ? `: ${newAppointmentDeepLink}` : '.'}\n- Para questões, contacte o suporte (Email: ${brandConfig.supportEmail}).` :
      `- O horário foi libertado.\n- Pode contactar o(a) paciente ${recipientName} pela plataforma, se necessário.\n- Ver Detalhes (cancelado): ${appointmentDeepLink}`
    }

Lamentamos qualquer inconveniente.

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
    htmlBody: mjmlBody,
    textBody,
  };
};