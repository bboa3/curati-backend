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
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getContractStatusPatientTextParts(templateData, brandConfig.appName);

  const preheaderText = `${textParts.title} - ${textParts.line1.replace(/<strong>|<\/strong>/g, '').substring(0, 100)}...`;

  let titleColor = brandConfig.colors.PRIMARY;
  let highlightBoxBgColor = brandConfig.colors.PRIMARY4;
  let highlightBoxBorderColor = brandConfig.colors.PRIMARY;
  let highlightBoxTextColor = brandConfig.colors.PRIMARY;

  if (textParts.isNegative) {
    titleColor = brandConfig.colors.RED;
    highlightBoxBgColor = brandConfig.colors.RED4;
    highlightBoxBorderColor = brandConfig.colors.RED2;
    highlightBoxTextColor = brandConfig.colors.RED;
  } else if (textParts.isWarning) {
    titleColor = brandConfig.colors.ORANGE;
    highlightBoxBgColor = brandConfig.colors.YELLOW3;
    highlightBoxBorderColor = brandConfig.colors.ORANGE2;
    highlightBoxTextColor = brandConfig.colors.ORANGE;
  } else if (textParts.isPositive) {
    titleColor = brandConfig.colors.GREEN;
    highlightBoxTextColor = brandConfig.colors.GREEN;
  }

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
    ${textParts.emailTitle}
  </mj-text>
  <mj-text padding-bottom="10px">${textParts.greeting}</mj-text>
  <mj-text padding-bottom="10px">${textParts.line1}</mj-text> ${textParts.line2 ? `<mj-text padding-bottom="10px" font-size="14px" color="${brandConfig.colors.BLACK2}">${textParts.line2.replace(/<strong>|<\/strong>/g, '')}</mj-text>` : ''}
`;

  if (templateData.newContractStatus === ContractStatus.ACTIVE && templateData.invoiceNumber && textParts.line3 && textParts.line4) {
    mjmlBody += `
    <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-top="10px" padding-bottom="5px">
      Detalhes da Fatura Associada:
    </mj-text>
    <mj-text padding-bottom="15px">${textParts.line3.replace(/<strong>|<\/strong>/g, '')}</mj-text> <mj-raw><div class="highlight-box" style="border-left-color: ${highlightBoxBorderColor}; background-color: ${highlightBoxBgColor};"><mj-text color="${highlightBoxTextColor}">${textParts.line4}</mj-text></div></mj-raw> `;
  } else if (textParts.line3) {
    mjmlBody += `<mj-raw><div class="highlight-box" style="border-left-color: ${highlightBoxBorderColor}; background-color: ${highlightBoxBgColor};"><mj-text color="${highlightBoxTextColor}">${textParts.line3}</mj-text></div></mj-raw>`;
  } else {
    mjmlBody += '<mj-spacer height="10px" />';
  }


  if (textParts.primaryButtonText && deepLink) {
    let buttonBg = titleColor;
    if (textParts.isPositive && templateData.newContractStatus === ContractStatus.ACTIVE && templateData.invoiceNumber) {
      buttonBg = brandConfig.colors.PRIMARY;
    } else if (textParts.isPositive) {
      buttonBg = brandConfig.colors.GREEN;
    }

    mjmlBody += generateEmailButton({
      text: textParts.primaryButtonText,
      url: deepLink,
      brandConfig,
      customBackgroundColor: buttonBg,
    });
  }

  mjmlBody += `
  <mj-spacer height="20px" />
  <mj-text font-size="13px">Para qualquer questão, por favor, <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">contacte o nosso suporte</a>.</mj-text>
  <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;
  mjmlBody += generateEmailFooter({ brandConfig });

  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line2) textBody += `\n${textParts.line2.replace(/<strong>|<\/strong>/g, '')}`;
  if (templateData.newContractStatus === ContractStatus.ACTIVE && templateData.invoiceNumber && textParts.line3 && textParts.line4) {
    textBody += `\n\nFatura Associada:\n${textParts.line3.replace(/<strong>|<\/strong>/g, '')}`;
    textBody += `\n\n${textParts.line4.replace(/<strong>|<\/strong>/g, '')}`;
  } else if (textParts.line3) {
    textBody += `\n\n${textParts.line3.replace(/<strong>|<\/strong>/g, '')}`;
  }

  if (textParts.primaryButtonText && deepLink) {
    textBody += `\n\n${textParts.primaryButtonText}:\n${deepLink}`;
  }
  textBody += `\n\nPara questões, contacte: ${brandConfig.supportEmail}\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: mjmlBody,
    textBody: textBody.trim(),
  };
};