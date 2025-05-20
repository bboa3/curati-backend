import mjml2html from 'mjml';
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
  const appNameToUse = isPharmacist ? "Cúrati RX" : "Cúrati Admin";

  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getMedicineOrderCreatedTextParts(templateData, brandConfig.appName);

  const preheaderText = `${textParts.line1.replace(/<[^>]+>/g, '').substring(0, 100)}...`;

  let titleColor = brandConfig.colors.PRIMARY;
  if (templateData.recipientRole === UserRole.ADMIN) titleColor = brandConfig.colors.BLACK2;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });
  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
    ${textParts.emailTitle}
  </mj-text>
  <mj-text padding-bottom="10px">${textParts.greeting}</mj-text>
  <mj-text padding-bottom="10px">${textParts.line1}</mj-text>
  ${textParts.line2 ? `<mj-text padding-bottom="10px" font-size="14px" color="${brandConfig.colors.BLACK2}">${textParts.line2}</mj-text>` : ''}
  ${textParts.line3 ? `<mj-text padding-bottom="20px" font-size="14px" color="${brandConfig.colors.BLACK2}">${textParts.line3}</mj-text>` : '<mj-spacer height="10px" />'}
  
  <mj-text padding-bottom="10px">${textParts.callToAction}</mj-text>
  ${generateEmailButton({
    text: textParts.buttonText,
    url: deepLink,
    brandConfig,
    customBackgroundColor: textParts.isPositive ? brandConfig.colors.GREEN : (textParts.isInfo ? brandConfig.colors.PRIMARY2 : brandConfig.colors.PRIMARY),
  })}
  <mj-spacer height="20px" />

  <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;
  mjmlBody += generateEmailFooter({ brandConfig, showSupportEmail: templateData.recipientRole !== UserRole.ADMIN });


  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<[^>]+>/g, '')}`;
  if (textParts.line2) textBody += `\n${textParts.line2.replace(/<[^>]+>/g, '')}`;
  if (textParts.line3) textBody += `\n${textParts.line3.replace(/<[^>]+>/g, '')}`;
  textBody += `\n\n${textParts.callToAction}`;
  textBody += `\n\n${textParts.buttonText}:\n${deepLink}`;
  textBody += `\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};