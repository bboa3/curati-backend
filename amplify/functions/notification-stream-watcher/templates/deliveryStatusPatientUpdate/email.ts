import mjml2html from 'mjml';
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

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  let titleColor = brandConfig.colors.PRIMARY;
  if (statusParts.isNegative) titleColor = brandConfig.colors.RED;
  else if (statusParts.isNeutral && !statusParts.isPositive) titleColor = brandConfig.colors.ORANGE;

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
    ${statusParts.emailTitle}
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="10px">${statusParts.line1}</mj-text>
  ${statusParts.line2 ? `<mj-text padding-bottom="20px">${statusParts.line2}</mj-text>` : '<mj-spacer height="10px" />'}
`;

  if (statusParts.primaryButtonText && deepLink) {
    let buttonBgColor = brandConfig.colors.PRIMARY;
    let buttonTextColor = brandConfig.colors.WHITE;
    if (statusParts.isNegative) {
      buttonBgColor = brandConfig.colors.RED2;
    } else if (statusParts.isNeutral && !statusParts.isPositive) {
      buttonBgColor = brandConfig.colors.ORANGE2;
      buttonTextColor = brandConfig.colors.BLACK;
    }
    mjmlBody += generateEmailButton({
      text: statusParts.primaryButtonText,
      url: deepLink,
      brandConfig,
      customBackgroundColor: buttonBgColor,
      customTextColor: buttonTextColor,
    });
  }

  mjmlBody += `
  <mj-spacer height="20px" />
  <mj-text font-size="13px">
    Para qualquer questão, o nosso <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">suporte ao cliente</a> está à disposição.
  </mj-text>
  <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;
  mjmlBody += generateEmailFooter({ brandConfig });

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
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};