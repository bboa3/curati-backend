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
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const subject = `${brandConfig.appName}: Agendamento #${appointmentNumber} Confirmado!`;
  const currentYear = new Date().getFullYear();
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);
  const appointmentDeepLink = payload.href ? payload.href : '';

  const meetingWithText = recipientType === AppointmentParticipantType.PATIENT ? `com ${otherPartyName}` : `com o(a) paciente ${otherPartyName}`;
  const preheaderText = `O seu agendamento ${meetingWithText} para ${formattedDateTime} está confirmado.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });


  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="15px">
    Agendamento Confirmado!
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="20px">
    O seu agendamento ${meetingWithText} para "${purpose}" foi confirmado com sucesso.
  </mj-text>

  <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">
    Detalhes Confirmados:
  </mj-text>
  <mj-text padding-bottom="5px">• <strong>Tipo:</strong> ${formattedType}</mj-text>
  <mj-text padding-bottom="5px">• <strong>Data:</strong> ${formattedDateTime}</mj-text>
  <mj-text padding-bottom="5px">• <strong>Com:</strong> ${otherPartyName}</mj-text>
  
  ${generateEmailButton({
    text: "Ver Detalhes na App",
    url: appointmentDeepLink,
    brandConfig,
  })}
  <mj-spacer height="20px" />

  <mj-text font-size="13px">
    Por favor, anote na sua agenda. Se precisar reagendar ou cancelar, utilize a aplicação com antecedência.
  </mj-text>

  <mj-text padding-top="20px">Obrigado,<br />Equipa ${brandConfig.appName}</mj-text>
`;

  mjmlBody += generateEmailFooter({ brandConfig });

  const textBody = `
${brandConfig.appName}: Agendamento #${appointmentNumber} Confirmado!

Prezado(a) ${recipientName},

O seu agendamento ${meetingWithText} para "${purpose}" foi confirmado com sucesso.

Detalhes Confirmados:
- Tipo: ${formattedType}
- Data: ${formattedDateTime}
- Com: ${otherPartyName}
Ver Detalhes na App:
${appointmentDeepLink}

Por favor, anote na sua agenda. Se precisar reagendar ou cancelar, utilize a aplicação com antecedência.

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