import { NotificationChannel, NotificationPayload, UserRole } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getMedicineOrderCreatedTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const { recipientRole } = templateData;
  const isPharmacist = recipientRole === UserRole.PROFESSIONAL;
  const appName = isPharmacist ? 'Cúrati RX' : 'Cúrati';
  const brandConfig = getDefaultBrandConfig({ appName });
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getMedicineOrderCreatedTextParts(templateData, brandConfig.appName);
  const preheaderText = `${textParts.line1.replace(/<[^>]+>/g, '').substring(0, 100)}...`;

  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.PRIMARY};">
      ${textParts.emailTitle}
    </h2>
    <p style="margin:0 0 10px;">${textParts.greeting}</p>
    <p style="margin:0 0 10px;">${textParts.line1}</p>
    ${textParts.line2 ? `<p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 10px;">${textParts.line2}</p>` : ''}
    ${textParts.line3 ? `<p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 20px;">${textParts.line3}</p>` : '<div style="height:10px;"></div>'}
    <p style="margin:0 0 10px;">${textParts.callToAction}</p>
    ${generateEmailButton({
    text: textParts.buttonText,
    url: deepLink,
    brandConfig,
    customBackgroundColor: textParts.isPositive
      ? brandConfig.colors.GREEN
      : brandConfig.colors.PRIMARY,
  })}
    <div style="height:20px;"></div>
    <p style="margin:0;padding-top:20px;">
      Atenciosamente,<br/>Equipa ${brandConfig.appName}
    </p>
  `;
  html += generateEmailFooter({
    brandConfig,
    showSupportEmail: recipientRole !== UserRole.ADMIN,
  });

  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<[^>]+>/g, '')}`;
  if (textParts.line2) textBody += `\n${textParts.line2.replace(/<[^>]+>/g, '')}`;
  if (textParts.line3) textBody += `\n${textParts.line3.replace(/<[^>]+>/g, '')}`;
  textBody += `\n\n${textParts.callToAction}\n\n${textParts.buttonText}: ${deepLink}`;
  textBody += `\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: html,
    textBody,
  };
};