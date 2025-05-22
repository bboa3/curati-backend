import { Logger } from '@aws-lambda-powertools/logger';
import mjml2html from 'mjml-core';
import { formatDateTimeNumeric } from '../../../helpers/date/formatter';
import { formatToMZN } from '../../../helpers/number-formatter';
import { InvoiceSourceType, InvoiceStatus, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { convertInvoiceStatus } from '../../helpers/enum/invoice-status';
import { convertPaymentTermsType } from '../../helpers/enum/payment-terms';
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';
import { getInvoiceCreatedTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
}


const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});


export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getInvoiceCreatedTextParts(templateData, brandConfig.appName);

  const formattedInvoiceDate = formatDateTimeNumeric(templateData.invoiceCreatedAt);
  const formattedDueDate = formatDateTimeNumeric(templateData.invoiceDueDate);

  const preheaderText = `Fatura #${templateData.invoiceNumber} de ${formatToMZN(templateData.invoiceTotalAmount)} está ${templateData.invoiceStatus === InvoiceStatus.PENDING_PAYMENT ? 'pronta para pagamento.' : 'disponível.'}`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="5px">
    ${textParts.emailTitle}
  </mj-text>
  <mj-text font-size="14px" color="${brandConfig.colors.BLACK2}" padding-bottom="15px">
    Data de Emissão: ${formattedInvoiceDate} | Vencimento: ${formattedDueDate}
  </mj-text>
  <mj-text padding-bottom="10px">${textParts.greeting}</mj-text>
  <mj-text padding-bottom="10px">${textParts.line1}</mj-text>
  <mj-text padding-bottom="20px" font-size="14px">${textParts.invoiceSourceDescription}</mj-text>

  <mj-divider border-color="${brandConfig.colors.BLACK4}" border-width="1px" padding="10px 0" />

  <mj-text font-size="18px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-top="10px" padding-bottom="10px">
    Sumário Financeiro:
  </mj-text>
  <mj-table cellpadding="5px">
    <tr>
      <td style="color: ${brandConfig.colors.BLACK2};">Subtotal:</td>
      <td style="text-align: right;">${formatToMZN(templateData.invoiceSubTotal)}</td>
    </tr>
    ${templateData.invoiceDiscount > 0 ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">Desconto:</td><td style="text-align: right;">-${formatToMZN(templateData.invoiceDiscount)}</td></tr>` : ''}
    ${templateData.totalDeliveryFee || 0 > 0 && templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">Taxa de Entrega:</td><td style="text-align: right;">${formatToMZN(templateData.totalDeliveryFee || 0)}</td></tr>` : ''}
    ${templateData.invoiceTotalTax > 0 ? `<tr><td style="color: ${brandConfig.colors.BLACK2};">IVA:</td><td style="text-align: right;">${formatToMZN(templateData.invoiceTotalTax)}</td></tr>` : ''}
    <mj-raw><tr><td colspan="2"><div style="border-top: 1px solid ${brandConfig.colors.BLACK3}; margin: 5px 0;"></div></td></tr></mj-raw>
    <tr>
      <td style="font-weight: bold; font-size: 1.1em; color: ${brandConfig.colors.BLACK};">Total a Pagar:</td>
      <td style="text-align: right; font-weight: bold; font-size: 1.1em; color: ${brandConfig.colors.PRIMARY};">${formatToMZN(templateData.invoiceTotalAmount)}</td>
    </tr>
  </mj-table>
  
  <mj-text padding-top="10px" padding-bottom="5px" font-size="16px" font-weight="bold">
    Estado Atual: <span style="color:${templateData.invoiceStatus === InvoiceStatus.PAID ? brandConfig.colors.GREEN : (templateData.invoiceStatus === InvoiceStatus.PENDING_PAYMENT ? brandConfig.colors.ORANGE : brandConfig.colors.BLACK2)};">${convertInvoiceStatus(templateData.invoiceStatus)}</span>
  </mj-text>
  ${templateData.paymentTerms ? `<mj-text font-size="13px" color="${brandConfig.colors.BLACK2}" padding-bottom="15px">Termos: ${convertPaymentTermsType(templateData.paymentTerms)}</mj-text>` : ''}

  ${generateEmailButton({
    text: textParts.buttonTextPay,
    url: deepLink,
    brandConfig,
    customBackgroundColor: brandConfig.colors.PRIMARY, // Green for payment
  })}
  ${templateData.invoiceDocumentUrl && textParts.buttonTextDownloadPdf ? `
    <mj-spacer height="10px" />
    ${generateEmailButton({
    text: textParts.buttonTextDownloadPdf,
    url: templateData.invoiceDocumentUrl,
    brandConfig,
    customBackgroundColor: brandConfig.colors.BLACK3, // Neutral secondary button
    customTextColor: brandConfig.colors.BLACK,
  })}` : ''}
  <mj-spacer height="20px" />

  <mj-text font-size="13px">Se tiver alguma dúvida, por favor <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">contacte o nosso suporte</a>.</mj-text>
  <mj-text padding-top="20px">Obrigado,<br />Equipa ${brandConfig.appName}</mj-text>
`;
  mjmlBody += generateEmailFooter({ brandConfig });

  // --- Plain Text Body ---
  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1.replace(/<strong>|<\/strong>/g, '')}\n${textParts.invoiceSourceDescription.replace(/<strong>|<\/strong>/g, '')}`;
  textBody += `\n\nSumário Financeiro:`;
  textBody += `\n- Fatura Nº: ${templateData.invoiceNumber}`;
  textBody += `\n- Emissão: ${formattedInvoiceDate}`;
  textBody += `\n- Vencimento: ${formattedDueDate}`;
  textBody += `\n- Subtotal: ${formatToMZN(templateData.invoiceSubTotal)}`;
  if (templateData.invoiceDiscount > 0) textBody += `\n- Desconto: -${formatToMZN(templateData.invoiceDiscount)}`;
  if (templateData.totalDeliveryFee || 0 > 0 && templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) textBody += `\n- Taxa de Entrega: ${formatToMZN(templateData.totalDeliveryFee || 0)}`;
  if (templateData.invoiceTotalTax > 0) textBody += `\n- IVA: ${formatToMZN(templateData.invoiceTotalTax)}`;
  textBody += `\n- TOTAL A PAGAR: ${formatToMZN(templateData.invoiceTotalAmount)}`;
  textBody += `\n- Estado: ${convertInvoiceStatus(templateData.invoiceStatus)}`;
  if (templateData.paymentTerms) textBody += `\n- Termos: ${convertPaymentTermsType(templateData.paymentTerms)}`;

  textBody += `\n\n${textParts.buttonTextPay}:\n${deepLink}`;
  if (templateData.invoiceDocumentUrl && textParts.buttonTextDownloadPdf) {
    textBody += `\n\n${textParts.buttonTextDownloadPdf}:\n${templateData.invoiceDocumentUrl}`;
  }
  textBody += `\n\nSe tiver dúvidas, contacte o suporte: ${brandConfig.supportEmail}`;
  textBody += `\n\nObrigado,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n---\nCopyright © ${brandConfig.copyrightYearStart}-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.`;

  logger.info(`MJML Body`, { mjmlBody });
  logger.info(`MJML Body`, { htmlBody: mjml2html(mjmlBody) });

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: `
    <html>
      <head>
      </head>
      <body>
        <p>Test email</p>
      </body>
    </html>
    `,
    textBody,
  };
};