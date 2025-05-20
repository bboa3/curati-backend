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

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  let titleColor = brandConfig.colors.PRIMARY;
  if (statusParts.isNegative) titleColor = brandConfig.colors.RED;
  else if (statusParts.isNeutral && !statusParts.isPositive) titleColor = brandConfig.colors.ORANGE;
  else if (statusParts.isPositive) titleColor = brandConfig.colors.GREEN;

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
    ${statusParts.emailTitle}
  </mj-text>
  <mj-text padding-bottom="10px">Olá ${recipientName},</mj-text>
  <mj-text padding-bottom="10px">${statusParts.line1}</mj-text>
  ${statusParts.line2 ? `<mj-text padding-bottom="20px">${statusParts.line2}</mj-text>` : '<mj-spacer height="10px" />'}
  ${statusParts.line3 ? `<mj-raw><div class="highlight-box" style="border-left-color: ${titleColor};"><mj-text>${statusParts.line3}</mj-text></div></mj-raw>` : ''}
`;

  if (statusParts.primaryButtonText && deepLink) {
    mjmlBody += generateEmailButton({
      text: statusParts.primaryButtonText,
      url: deepLink,
      brandConfig,
      customBackgroundColor: titleColor,
    });
  }

  mjmlBody += `
  <mj-spacer height="20px" />
  <mj-text padding-top="20px">Obrigado pelo seu trabalho,<br />Equipa ${brandConfig.appName}</mj-text>
`;
  mjmlBody += generateEmailFooter({ brandConfig });

  // --- Plain Text Body ---
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
    htmlBody: mjmlBody,
    textBody,
  };
};