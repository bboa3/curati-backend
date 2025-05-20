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
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati RX' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getContractStatusProfessionalTextParts(templateData, brandConfig.appName);

  const preheaderText = `${textParts.title} (${templateData.contractNumber}) - ${textParts.line1.replace(/<strong>|<\/strong>/g, '').substring(0, 100)}...`;

  let titleColor = brandConfig.colors.PRIMARY;
  let highlightBoxBgColor = brandConfig.colors.PRIMARY4;
  let highlightBoxBorderColor = brandConfig.colors.PRIMARY;
  let highlightBoxTextColor = brandConfig.colors.BLACK;

  if (textParts.isNegative) {
    titleColor = brandConfig.colors.RED;
    highlightBoxBgColor = brandConfig.colors.RED4;
    highlightBoxBorderColor = brandConfig.colors.RED2;
    highlightBoxTextColor = brandConfig.colors.RED;
  } else if (textParts.isActionRequired) {
    titleColor = brandConfig.colors.ORANGE;
    highlightBoxBgColor = brandConfig.colors.YELLOW3;
    highlightBoxBorderColor = brandConfig.colors.ORANGE2;
    highlightBoxTextColor = brandConfig.colors.BLACK;
  } else if (textParts.isPositive) {
    titleColor = brandConfig.colors.GREEN;
    highlightBoxTextColor = brandConfig.colors.GREEN;
  } else if (textParts.isNeutral) {
    titleColor = brandConfig.colors.PRIMARY2;
  }
  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
    <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
      ${textParts.emailTitle}
    </mj-text>
    <mj-text padding-bottom="10px">${textParts.greeting}</mj-text>
    <mj-text padding-bottom="10px">${textParts.line1}</mj-text> ${textParts.line2Context ? `
      <mj-divider border-color="${brandConfig.colors.BLACK4}" border-width="1px" padding="15px 0" />
      <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="10px">
        Detalhes do Contrato:
      </mj-text>
      <mj-text padding-bottom="15px" font-size="14px" color="${brandConfig.colors.BLACK2}">${textParts.line2Context.replace(/<strong>|<\/strong>/g, '')}</mj-text>
    ` : ''}
    
    ${textParts.line3ActionOrInfo ? `<mj-raw><div class="highlight-box" style="border-left-color: ${highlightBoxBorderColor}; background-color: ${highlightBoxBgColor};"><mj-text color="${highlightBoxTextColor}">${textParts.line3ActionOrInfo}</mj-text></div></mj-raw>` : '<mj-spacer height="10px" />'}
  `;

  if (textParts.primaryButtonText && deepLink) {
    let buttonBg = titleColor;
    if (textParts.isActionRequired) buttonBg = brandConfig.colors.PRIMARY;
    else if (textParts.isPositive) buttonBg = brandConfig.colors.GREEN;
    else if (textParts.isNeutral || textParts.isNegative) buttonBg = brandConfig.colors.BLACK3;

    mjmlBody += generateEmailButton({
      text: textParts.primaryButtonText,
      url: deepLink,
      brandConfig,
      customBackgroundColor: buttonBg,
      customTextColor: (buttonBg === brandConfig.colors.BLACK3) ? brandConfig.colors.BLACK : brandConfig.colors.WHITE,
    });
  }

  mjmlBody += `
    <mj-spacer height="20px" />
    <mj-text font-size="13px">Se tiver alguma questão, por favor, contacte a administração Cúrati.</mj-text>
    <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
  `;
  mjmlBody += generateEmailFooter({ brandConfig, showSupportEmail: false });

  // --- Plain Text Body ---
  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line2Context) textBody += `\n\nDetalhes do Contrato:\n${textParts.line2Context.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line3ActionOrInfo) textBody += `\n\n${textParts.line3ActionOrInfo.replace(/<strong>|<\/strong>/g, '')}`;

  if (textParts.primaryButtonText && deepLink) {
    textBody += `\n\n${textParts.primaryButtonText}:\n${deepLink}`;
  }
  textBody += `\n\nSe tiver questões, contacte a administração Cúrati.\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: mjmlBody,
    textBody: textBody.trim(),
  };
};