import { ContractStatus, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getContractStatusPatientTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getContractStatusPatientTextParts(templateData, brandConfig.appName);

  const preheaderText = `${textParts.title} – ${textParts.line1.replace(/<strong>|<\/strong>/g, '').slice(0, 100)}…`;
  let titleColor = brandConfig.colors.PRIMARY;
  let boxBg = brandConfig.colors.PRIMARY4, boxBorder = brandConfig.colors.PRIMARY, boxText = brandConfig.colors.PRIMARY;
  if (textParts.isNegative) { titleColor = brandConfig.colors.RED; boxBg = brandConfig.colors.RED4; boxBorder = brandConfig.colors.RED2; boxText = brandConfig.colors.RED; }
  else if (textParts.isWarning) { titleColor = brandConfig.colors.ORANGE; boxBg = brandConfig.colors.YELLOW3; boxBorder = brandConfig.colors.ORANGE2; boxText = brandConfig.colors.ORANGE; }
  else if (textParts.isPositive) { titleColor = brandConfig.colors.GREEN; boxText = brandConfig.colors.GREEN; }

  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `
    <h2 style="margin:0 0 16px;color:${titleColor};">${textParts.emailTitle}</h2>
    <p style="margin:0 0 10px;">${textParts.greeting}</p>
    <p style="margin:0 0 10px;">${textParts.line1}</p>
    ${textParts.line2 ? `<p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 15px;">${textParts.line2}</p>` : ''}
  `;
  if (templateData.newContractStatus === ContractStatus.ACTIVE && templateData.invoiceNumber && textParts.line3 && textParts.line4) {
    html += `<p style="font-size:16px;font-weight:bold;margin:10px 0 5px;">Fatura Associada:</p><p style="margin:0 0 10px;">${textParts.line3}</p><div style="border-left:5px solid ${boxBorder};background:${boxBg};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${boxText};">${textParts.line4}</div>`;
  } else if (textParts.line3) {
    html += `<div style="border-left:5px solid ${boxBorder};background:${boxBg};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${boxText};">${textParts.line3}</div>`;
  } else html += `<div style="height:10px"></div>`;

  if (textParts.primaryButtonText) {
    let btnBg = titleColor;
    if (textParts.isPositive && templateData.newContractStatus === ContractStatus.ACTIVE && templateData.invoiceNumber) btnBg = brandConfig.colors.PRIMARY;
    else if (textParts.isPositive) btnBg = brandConfig.colors.GREEN;
    html += generateEmailButton({ text: textParts.primaryButtonText, url: deepLink, brandConfig, customBackgroundColor: btnBg });
  }
  html += `<div style="height:20px"></div><p style="font-size:13px;">Para questões, <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};text-decoration:none;">contacte o nosso suporte</a>.</p><p style="margin:0;padding-top:20px;">Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>`;
  html += generateEmailFooter({ brandConfig });

  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1}`;
  if (textParts.line2) textBody += `\n${textParts.line2}`;
  if (templateData.newContractStatus === ContractStatus.ACTIVE && templateData.invoiceNumber && textParts.line3 && textParts.line4) { textBody += `\n\nFatura Associada:\n${textParts.line3}\n${textParts.line4}`; } else if (textParts.line3) { textBody += `\n\n${textParts.line3}`; }
  if (textParts.primaryButtonText) textBody += `\n\n${textParts.primaryButtonText}: ${deepLink}`;
  textBody += `\n\nPara questões, contacte: ${brandConfig.supportEmail}\n\nAtenciosamente, Equipa ${brandConfig.appName}`;
  textBody += `\n\n© ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA.`;

  return { emailAddresses: channel.targets, subject: textParts.subject, htmlBody: html, textBody };
};