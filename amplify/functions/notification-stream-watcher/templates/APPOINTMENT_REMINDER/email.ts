import { AppointmentParticipantType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getAppointmentReminderTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const appName = templateData.recipientType === AppointmentParticipantType.PROFESSIONAL
    ? 'Cúrati Rx'
    : 'Cúrati';
  const brandConfig = getDefaultBrandConfig({ appName });
  const deepLink = payload.href || '';
  const textParts = getAppointmentReminderTextParts(templateData, brandConfig.appName);
  const preheaderText = `${textParts.title} – ${textParts.line1.replace(/<strong>|<\/strong>/g, '').slice(0, 100)}…`;
  const titleColor = brandConfig.colors.PRIMARY2;

  let html = generateEmailHeader({ brandConfig, preheaderText });

  html += `
    <h2 style="margin:0 0 16px;color:${titleColor};">
      ${textParts.emailTitle}
    </h2>
    <p style="margin:0 0 10px;">${textParts.greeting}</p>
    <p style="margin:0 0 15px;">${textParts.line1}</p>
    ${textParts.line2Context ? `
      <p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 15px;">
        <strong>Detalhes:</strong> ${textParts.line2Context}
      </p>` : ''}
    ${textParts.line3ActionInstruction ? `
      <div style="
        border-left:5px solid ${titleColor};
        background:${brandConfig.colors.PRIMARY4};
        padding:10px 15px;
        border-radius:4px;
        margin:0 0 15px;
      ">
        <p style="margin:0;color:${brandConfig.colors.BLACK2};">
          ${textParts.line3ActionInstruction}
        </p>
      </div>` : `<div style="height:10px;"></div>`}
    ${generateEmailButton({
    text: textParts.buttonText,
    url: deepLink,
    brandConfig,
    customBackgroundColor:
      textParts.isImminent && templateData.appointmentType !== 'IN_PERSON'
        ? brandConfig.colors.GREEN
        : brandConfig.colors.PRIMARY,
  })}
    <div style="height:20px;"></div>
    <p style="font-size:13px;margin:0 0 5px;">
      Se precisar reagendar ou cancelar (com antecedência permitida), aceda à sua área na plataforma ${brandConfig.appName}.
    </p>
    <p style="margin:0;">Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig });

  let textBody = `
${textParts.subject}

${textParts.greeting}

${textParts.line1}
${textParts.line2Context ? `\nDetalhes: ${textParts.line2Context}` : ''}
${textParts.line3ActionInstruction ? `\n\nAção: ${textParts.line3ActionInstruction}` : ''}

${textParts.buttonText}:
${deepLink}

Se precisar reagendar/cancelar, aceda à plataforma ${brandConfig.appName}.

Atenciosamente,
Equipa ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${new Date().getFullYear()} ${brandConfig.appNameLegal}.
`.trim();

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: html,
    textBody,
  };
};