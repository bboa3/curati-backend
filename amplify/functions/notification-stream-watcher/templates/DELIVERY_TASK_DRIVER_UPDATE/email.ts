import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getDriverDeliveryStatusTextParts } from './status-text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const { recipientName } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Go' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const statusParts = getDriverDeliveryStatusTextParts(templateData);

  const subject = `${brandConfig.appName}: ${statusParts.subjectSuffix}`;
  const preheaderText = `${statusParts.title} - ${statusParts.line1.substring(0, 100)}${statusParts.line1.length > 100 ? '...' : ''}`;

  let titleColor = brandConfig.colors.PRIMARY;
  if (statusParts.isNegative) titleColor = brandConfig.colors.RED;
  else if (statusParts.isNeutral) titleColor = brandConfig.colors.ORANGE;
  else if (statusParts.isPositive) titleColor = brandConfig.colors.GREEN;
  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `<h2 style=\"margin:0 0 16px;color:${titleColor};\">${statusParts.emailTitle}</h2><p style=\"margin:0 0 10px;\">Olá ${recipientName},</p><p style=\"margin:0 0 10px;\">${statusParts.line1}</p>`;
  if (statusParts.line2) html += `<p style=\"margin:0 0 20px;\">${statusParts.line2}</p>`;
  if (statusParts.line3) html += `<div style=\"border-left:5px solid ${titleColor};padding:10px 15px;border-radius:4px;margin:0 0 15px;\">${statusParts.line3}</div>`;
  if (statusParts.primaryButtonText) html += generateEmailButton({ text: statusParts.primaryButtonText, url: deepLink, brandConfig, customBackgroundColor: titleColor });
  html += `<div style=\"height:20px;\"></div><p style=\"margin:0;\">Obrigado pelo seu trabalho,<br/>Equipa ${brandConfig.appName}</p>`;
  html += generateEmailFooter({ brandConfig });

  let textBody = `${subject}\n\nOlá ${recipientName},\n\n${statusParts.line1}`;
  if (statusParts.line2) textBody += `\n${statusParts.line2}`;
  if (statusParts.line3) textBody += `\n\n${statusParts.line3}`;

  if (statusParts.primaryButtonText && deepLink) {
    textBody += `\n\n${statusParts.primaryButtonText}:\n${deepLink}`;
  }

  textBody += `\n\nObrigado pelo seu trabalho,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: html,
    textBody,
  };
};