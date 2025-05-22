import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getContractStatusProfessionalTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Rx' });
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getContractStatusProfessionalTextParts(templateData, brandConfig.appName);

  const preheaderText = `${textParts.title} (${templateData.contractNumber}) – ${textParts.line1.replace(/<strong>|<\/strong>/g, '').slice(0, 100)}…`;
  let titleColor = brandConfig.colors.PRIMARY, boxBg = brandConfig.colors.PRIMARY4, boxBorder = brandConfig.colors.PRIMARY, boxText = brandConfig.colors.BLACK;
  if (textParts.isNegative) { titleColor = brandConfig.colors.RED; boxBg = brandConfig.colors.RED4; boxBorder = brandConfig.colors.RED2; boxText = brandConfig.colors.RED; }
  else if (textParts.isActionRequired) { titleColor = brandConfig.colors.ORANGE; boxBg = brandConfig.colors.YELLOW3; boxBorder = brandConfig.colors.ORANGE2; boxText = brandConfig.colors.BLACK; }
  else if (textParts.isPositive) { titleColor = brandConfig.colors.GREEN; boxText = brandConfig.colors.GREEN; }
  else if (textParts.isNeutral) { titleColor = brandConfig.colors.PRIMARY2; }

  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `<h2 style="margin:0 0 16px;color:${titleColor};">${textParts.emailTitle}</h2><p style="margin:0 0 10px;">${textParts.greeting}</p><p style="margin:0 0 10px;">${textParts.line1}</p>`;
  if (textParts.line2Context) { html += `<hr style="border:none;border-top:1px solid ${brandConfig.colors.BLACK4};margin:15px 0;"/><p style="font-size:16px;font-weight:bold;margin:0 0 10px;color:${brandConfig.colors.BLACK};">Detalhes do Contrato:</p><p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 15px;">${textParts.line2Context}</p>`; }
  html += textParts.line3ActionOrInfo ? `<div style="border-left:5px solid ${boxBorder};background:${boxBg};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${boxText};">${textParts.line3ActionOrInfo}</div>` : `<div style="height:10px"></div>`;
  if (textParts.primaryButtonText) { let btnBg = titleColor; if (textParts.isActionRequired) btnBg = brandConfig.colors.PRIMARY; else if (textParts.isPositive) btnBg = brandConfig.colors.GREEN; else if (textParts.isNeutral || textParts.isNegative) btnBg = brandConfig.colors.BLACK3; let txtCol = btnBg === brandConfig.colors.BLACK3 ? brandConfig.colors.BLACK : brandConfig.colors.WHITE; html += generateEmailButton({ text: textParts.primaryButtonText, url: deepLink, brandConfig, customBackgroundColor: btnBg, customTextColor: txtCol }); }
  html += `<div style="height:20px"></div><p style="font-size:13px;">Se tiver alguma questão, contacte a administração Cúrati.</p><p style="margin:0;padding-top:20px;">Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>`;
  html += generateEmailFooter({ brandConfig, showSupportEmail: false });
  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1}`;
  if (textParts.line2Context) textBody += `\n\nDetalhes do Contrato:\n${textParts.line2Context}`;
  if (textParts.line3ActionOrInfo) textBody += `\n\n${textParts.line3ActionOrInfo}`;
  if (textParts.primaryButtonText) textBody += `\n\n${textParts.primaryButtonText}: ${deepLink}`;
  textBody += `\n\nSe tiver questões, contacte a administração Cúrati.\n\nAtenciosamente, Equipa ${brandConfig.appName}`;
  textBody += `\n\n---\n© ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA.`;
  return { emailAddresses: channel.targets, subject: textParts.subject, htmlBody: html, textBody };
};
