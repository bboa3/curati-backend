import mjml2html from 'mjml';
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
  const appNameToUse = templateData.recipientType === AppointmentParticipantType.PROFESSIONAL ? "Cúrati Rx" : "Cúrati";
  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const currentYear = new Date().getFullYear();
  const deepLink = payload.href ? payload.href : '';
  const textParts = getAppointmentReminderTextParts(templateData, brandConfig.appName);

  const preheaderText = `${textParts.title} - ${textParts.line1.replace(/<strong>|<\/strong>/g, '').substring(0, 100)}...`;
  const titleColor = brandConfig.colors.PRIMARY2;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
    <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
      ${textParts.emailTitle}
    </mj-text>
    <mj-text padding-bottom="10px">${textParts.greeting}</mj-text>
    <mj-text padding-bottom="15px">${textParts.line1}</mj-text> ${textParts.line2Context ? `<mj-text padding-bottom="5px" font-size="14px" color="${brandConfig.colors.BLACK2}"><strong>Detalhes:</strong> ${textParts.line2Context}</mj-text>` : ''}
    ${textParts.line3ActionInstruction ? `<mj-raw><div class="highlight-box" style="margin-top: 10px; margin-bottom:15px; border-left-color: ${brandConfig.colors.PRIMARY2}; background-color: ${brandConfig.colors.PRIMARY4};"><mj-text color="${brandConfig.colors.BLACK2}">${textParts.line3ActionInstruction}</mj-text></div></mj-raw>` : '<mj-spacer height="10px" />'}
    
    ${generateEmailButton({
    text: textParts.buttonText,
    url: deepLink,
    brandConfig,
    customBackgroundColor: textParts.isImminent && templateData.appointmentType !== 'IN_PERSON' ? brandConfig.colors.GREEN : brandConfig.colors.PRIMARY,
  })}
    <mj-spacer height="20px" />

    <mj-text font-size="13px">
      Se precisar reagendar ou cancelar (com antecedência permitida), por favor, aceda à sua área na plataforma ${brandConfig.appName}.
    </mj-text>
    <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
  `;
  mjmlBody += generateEmailFooter({ brandConfig });

  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line2Context) textBody += `\nDetalhes: ${textParts.line2Context}`;
  if (textParts.line3ActionInstruction) textBody += `\n\nAção: ${textParts.line3ActionInstruction}`;
  textBody += `\n\n${textParts.buttonText}:\n${deepLink}`;
  textBody += `\n\nSe precisar reagendar/cancelar, aceda à plataforma ${brandConfig.appName}.`;
  textBody += `\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody: textBody.trim(),
  };
};