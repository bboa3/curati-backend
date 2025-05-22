import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from '../shared/footer';
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getAdminDeliveryAlertTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const { recipientName } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Admin' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const statusParts = getAdminDeliveryAlertTextParts(templateData);

  const subject = `${statusParts.subjectSuffix}`;
  const preheaderText = `${statusParts.title}: ${statusParts.line1.substring(0, 100)}...`;

  let titleColor = brandConfig.colors.BLACK2;
  if (statusParts.isCritical) titleColor = brandConfig.colors.RED;
  else if (statusParts.isWarning) titleColor = brandConfig.colors.ORANGE;
  else if (statusParts.isPositive) titleColor = brandConfig.colors.GREEN;
  else if (statusParts.isInfo) titleColor = brandConfig.colors.PRIMARY;

  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `<h2 style=\"margin:0 0 16px;color:${titleColor};\">${statusParts.emailTitle}</h2><p style=\"margin:0 0 10px;\">Estimada Equipa,</p><p style=\"margin:0 0 10px;\">${statusParts.line1}</p>`;
  if (statusParts.line2) html += `<p style=\"font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 10px;\">${statusParts.line2}</p>`;
  if (statusParts.line3) html += `<div style=\"border-left:5px solid ${titleColor};background:${brandConfig.colors.PRIMARY4};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${statusParts.isCritical ? brandConfig.colors.RED : brandConfig.colors.BLACK};\">${statusParts.line3}</div>`;
  if (statusParts.primaryButtonText) html += generateEmailButton({ text: statusParts.primaryButtonText, url: deepLink, brandConfig, customBackgroundColor: titleColor, customTextColor: brandConfig.colors.WHITE });
  html += `<div style=\"height:20px;\"></div><p style=\"margin:0;\">Cumprimentos,<br/>Sistema de Alertas ${brandConfig.appName}</p>`;
  html += generateEmailFooter({ brandConfig });


  let textBody = `${subject}\n\nEstimada Equipa ${recipientName || brandConfig.appName},\n\n${statusParts.line1}`;
  if (statusParts.line2) textBody += `\n${statusParts.line2}`;
  if (statusParts.line3) textBody += `\n\n${statusParts.line3}`;

  if (statusParts.primaryButtonText && deepLink) {
    textBody += `\n\n${statusParts.primaryButtonText}:\n${deepLink}`;
  }
  textBody += `\n\nCumprimentos,\nSistema de Alertas ${brandConfig.appName}`;
  textBody += `\n\n---\nCúrati Saúde, LDA. ${currentYear}.`;

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: html,
    textBody,
  };
};