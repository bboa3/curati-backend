import mjml2html from 'mjml';
import { formatToMZN } from '../../../helpers/number-formatter';
import { InvoiceSourceType, InvoiceStatus, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getInvoiceStatusPatientTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getInvoiceStatusPatientTextParts(templateData, brandConfig.appName);

  let secondaryActionUrl: string | undefined;
  let secondaryButtonTextFromHelper = textParts.secondaryButtonText;

  if (templateData.newInvoiceStatus === InvoiceStatus.PAID) {
    if (templateData.invoiceDocumentUrl) {
      secondaryActionUrl = templateData.invoiceDocumentUrl;
      secondaryButtonTextFromHelper = "Ver Fatura (PDF)";
    }
  }

  const preheaderText = `${textParts.title} - ${textParts.line1.replace(/<strong>|<\/strong>/g, '').substring(0, 100)}...`;

  let titleColor = brandConfig.colors.PRIMARY;
  if (textParts.isNegative) titleColor = brandConfig.colors.RED;
  else if (textParts.isNeutral && !textParts.isPositive && !textParts.isNegative) titleColor = brandConfig.colors.ORANGE;
  else if (textParts.isPositive) titleColor = brandConfig.colors.GREEN;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${titleColor}" padding-bottom="15px">
    ${textParts.emailTitle}
  </mj-text>
  <mj-text padding-bottom="10px">${textParts.greeting}</mj-text>
  <mj-text padding-bottom="10px">${textParts.line1}</mj-text>
  ${textParts.line2 ? `<mj-text padding-bottom="10px" font-size="14px" color="${brandConfig.colors.BLACK2}">${textParts.line2}</mj-text>` : ''}
  ${textParts.line3 ? `<mj-raw><div class="highlight-box" style="border-left-color: ${titleColor}; background-color: ${textParts.isPositive ? brandConfig.colors.PRIMARY4 : (textParts.isNegative ? brandConfig.colors.RED4 : brandConfig.colors.YELLOW3)}; color: ${textParts.isPositive || textParts.isNegative ? titleColor : brandConfig.colors.BLACK};"><mj-text>${textParts.line3}</mj-text></div></mj-raw>` : '<mj-spacer height="10px" />'}
`;

  // Financial Details Table (for PAID and FAILED, similar to old templates)
  if (templateData.newInvoiceStatus === InvoiceStatus.PAID || templateData.newInvoiceStatus === InvoiceStatus.FAILED || templateData.newInvoiceStatus === InvoiceStatus.PENDING_PAYMENT || templateData.newInvoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW || templateData.newInvoiceStatus === InvoiceStatus.OVERDUE || templateData.newInvoiceStatus === InvoiceStatus.PARTIALLY_PAID) {
    mjmlBody += `
    <mj-divider border-color="${brandConfig.colors.BLACK4}" border-width="1px" padding="15px 0" />
    <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="10px">
      Detalhes da Fatura #${templateData.invoiceNumber}:
    </mj-text>
    <mj-table cellpadding="5px">
      ${templateData.invoiceSourceType === InvoiceSourceType.CONTRACT && templateData.serviceName ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">Serviço:</td><td>${templateData.serviceName}</td></tr>` : ''}
      ${templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER && templateData.orderNumber ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">Pedido Nº:</td><td>${templateData.orderNumber}</td></tr>` : ''}
      <tr>
        <td style="color: ${brandConfig.colors.BLACK2};">Subtotal:</td>
        <td style="text-align: right;">${formatToMZN(templateData.invoiceSubTotal)}</td>
      </tr>
      ${templateData.invoiceDiscount || 0 > 0 ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">Desconto:</td><td style="text-align: right;">-${formatToMZN(templateData.invoiceDiscount)}</td></tr>` : ''}
      ${templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER && templateData.totalDeliveryFee || 0 > 0 ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">Taxa Entrega:</td><td style="text-align: right;">${formatToMZN(templateData.totalDeliveryFee)}</td></tr>` : ''}
      ${templateData.invoiceTotalTax > 0 ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">IVA:</td><td style="text-align: right;">${formatToMZN(templateData.invoiceTotalTax)}</td></tr>` : ''}
      <mj-raw><tr><td colspan="2"><div style="border-top: 1px solid ${brandConfig.colors.BLACK3}; margin: 5px 0;"></div></td></tr></mj-raw>
      <tr>
        <td style="font-weight: bold; font-size: 1.1em;">Total:</td>
        <td style="text-align: right; font-weight: bold; font-size: 1.1em; color: ${titleColor};">${formatToMZN(templateData.invoiceTotalAmount)}</td>
      </tr>
    </mj-table>
    <mj-spacer height="10px" />
  `;
  }


  if (textParts.primaryButtonText && deepLink) {
    let buttonBgColor = titleColor;
    if (templateData.newInvoiceStatus === InvoiceStatus.PAID) buttonBgColor = brandConfig.colors.PRIMARY2;
    else if (templateData.newInvoiceStatus === InvoiceStatus.FAILED) buttonBgColor = brandConfig.colors.ORANGE;

    mjmlBody += generateEmailButton({
      text: textParts.primaryButtonText,
      url: deepLink,
      brandConfig,
      customBackgroundColor: buttonBgColor,
    });
  }

  if (secondaryButtonTextFromHelper && secondaryActionUrl) {
    mjmlBody += `<mj-spacer height="5px" />`;
    mjmlBody += generateEmailButton({
      text: secondaryButtonTextFromHelper,
      url: secondaryActionUrl,
      brandConfig,
      customBackgroundColor: brandConfig.colors.BLACK3,
      customTextColor: brandConfig.colors.BLACK,
    });
  }

  mjmlBody += `
  <mj-spacer height="20px" />
  <mj-text font-size="13px">Se tiver alguma dúvida, não hesite em <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">contactar o nosso suporte</a>.</mj-text>
  <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
`;
  mjmlBody += generateEmailFooter({ brandConfig });

  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line2) textBody += `\n${textParts.line2.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line3) textBody += `\n${textParts.line3.replace(/<strong>|<\/strong>/g, '')}`;

  if (templateData.newInvoiceStatus === InvoiceStatus.PAID || templateData.newInvoiceStatus === InvoiceStatus.FAILED || templateData.newInvoiceStatus === InvoiceStatus.PENDING_PAYMENT || templateData.newInvoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW || templateData.newInvoiceStatus === InvoiceStatus.OVERDUE) {
    textBody += `\n\nDetalhes da Fatura #${templateData.invoiceNumber}:`;
    textBody += `\nTotal: ${formatToMZN(templateData.invoiceTotalAmount)}`;
  }

  if (textParts.primaryButtonText && deepLink) {
    textBody += `\n\n${textParts.primaryButtonText}:\n${deepLink}`;
  }
  if (secondaryButtonTextFromHelper && secondaryActionUrl) {
    textBody += `\n\n${secondaryButtonTextFromHelper}:\n${secondaryActionUrl}`;
  }

  textBody += `\n\nPara dúvidas, contacte: ${brandConfig.supportEmail}\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};