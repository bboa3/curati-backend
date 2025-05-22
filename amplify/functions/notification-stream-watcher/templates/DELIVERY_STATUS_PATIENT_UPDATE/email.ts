import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getPatientDeliveryStatusTextParts } from './status-text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const { recipientName } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const statusParts = getPatientDeliveryStatusTextParts(templateData);

  const subject = `${brandConfig.appName}: ${statusParts.subjectSuffix}`;
  const preheaderText = `${statusParts.title} - ${statusParts.line1.substring(0, 100)}${statusParts.line1.length > 100 ? '...' : ''}`;

  let titleColor = brandConfig.colors.PRIMARY;
  if (statusParts.isNegative) titleColor = brandConfig.colors.RED;
  else if (statusParts.isNeutral) titleColor = brandConfig.colors.ORANGE;

  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `<h2 style=\"margin:0 0 16px;color:${titleColor};\">${statusParts.emailTitle}</h2><p style=\"margin:0 0 10px;\">Prezado(a) ${recipientName},</p><p style=\"margin:0 0 10px;\">${statusParts.line1}</p>`;
  if (statusParts.line2) html += `<p style=\"margin:0 0 20px;\">${statusParts.line2}</p>`;
  if (statusParts.primaryButtonText) html += generateEmailButton({ text: statusParts.primaryButtonText, url: deepLink, brandConfig, customBackgroundColor: (statusParts.isNegative ? brandConfig.colors.RED2 : (statusParts.isNeutral ? brandConfig.colors.ORANGE2 : brandConfig.colors.PRIMARY)), customTextColor: (statusParts.isNeutral ? brandConfig.colors.BLACK : brandConfig.colors.WHITE) });
  html += `<div style=\"height:20px;\"></div><p style=\"font-size:13px;margin:0;\">Para qualquer questão, contacte: <a href=\"mailto:${brandConfig.supportEmail}\" style=\"color:${brandConfig.colors.PRIMARY};\">suporte</a>.</p><p style=\"margin:0;padding-top:20px;\">Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>`;
  html += generateEmailFooter({ brandConfig });

  let textBody = `${subject}\n\nPrezado(a) ${recipientName},\n\n${statusParts.line1}`;
  if (statusParts.line2) textBody += `\n${statusParts.line2}`;

  if (statusParts.primaryButtonText && deepLink) {
    textBody += `\n\n${statusParts.primaryButtonText}:\n${deepLink}`;
  }

  textBody += `\n\nPara qualquer questão, contacte: ${brandConfig.supportEmail}\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.`

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: html,
    textBody,
  };
};