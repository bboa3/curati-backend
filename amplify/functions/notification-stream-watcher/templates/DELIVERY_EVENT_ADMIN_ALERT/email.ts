import mjml2html from 'mjml';
import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
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

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  let titleColor = brandConfig.colors.BLACK2;
  if (statusParts.isCritical) titleColor = brandConfig.colors.RED;
  else if (statusParts.isWarning || statusParts.isNegative) titleColor = brandConfig.colors.ORANGE;
  else if (statusParts.isPositive) titleColor = brandConfig.colors.GREEN;
  else if (statusParts.isInfo) titleColor = brandConfig.colors.PRIMARY;


  mjmlBody += `
    <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
      ${statusParts.emailTitle}
    </mj-text>
    <mj-text padding-bottom="10px">Estimada Equipa ${recipientName || brandConfig.appName},</mj-text>
    <mj-text padding-bottom="10px">${statusParts.line1}</mj-text>
    ${statusParts.line2 ? `<mj-text padding-bottom="10px" font-size="14px" color="${brandConfig.colors.BLACK2}">${statusParts.line2}</mj-text>` : ''}
    ${statusParts.line3 ? `<mj-raw><div class="highlight-box" style="border-left-color: ${titleColor}; margin-top:10px; margin-bottom:15px;"><mj-text color="${titleColor === brandConfig.colors.RED ? brandConfig.colors.RED2 : brandConfig.colors.BLACK}">${statusParts.line3}</mj-text></div></mj-raw>` : '<mj-spacer height="10px" />'}
  `;

  if (statusParts.primaryButtonText && deepLink) {
    let buttonBgColor = titleColor; // Default to title color
    let buttonTextColor = brandConfig.colors.WHITE;

    if (titleColor === brandConfig.colors.ORANGE) buttonBgColor = brandConfig.colors.ORANGE; // Ensure consistency
    else if (titleColor === brandConfig.colors.BLACK2) buttonBgColor = brandConfig.colors.BLACK3;

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
    <mj-text padding-top="20px">Cumprimentos,<br />Sistema de Alertas ${brandConfig.appName}</mj-text>
  `;
  // Simpler footer for internal admin emails
  mjmlBody += `
        </mj-column> 
      </mj-section> 
      <mj-section padding-top="0px">
        <mj-column>
          <mj-divider border-color="${brandConfig.colors.BLACK4}" border-width="1px" padding-top="10px" padding-bottom="10px" />
          <mj-text align="center" font-size="12px" color="${brandConfig.colors.BLACK2}" line-height="18px">
            Cúrati Saúde, LDA. ${currentYear}. Notificação Automática do Sistema.
          </mj-text>
          <mj-spacer height="20px" />
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`;


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
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};