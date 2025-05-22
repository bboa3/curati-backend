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

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getInvoiceCreatedTextParts(templateData, brandConfig.appName);

  const formattedInvoiceDate = formatDateTimeNumeric(templateData.invoiceCreatedAt);
  const formattedDueDate = formatDateTimeNumeric(templateData.invoiceDueDate);

  const preheaderText = `Fatura #${templateData.invoiceNumber} de ${formatToMZN(templateData.invoiceTotalAmount)} está ${templateData.invoiceStatus === InvoiceStatus.PENDING_PAYMENT ? 'pronta para pagamento.' : 'disponível.'}`;

  let htmlBody = generateEmailHeader({ brandConfig, preheaderText });

  htmlBody += `
  <h2 style="margin:0 0 16px;">${textParts.emailTitle}</h2>
  <p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 20px;">
    Emissão: ${formattedInvoiceDate} | Vencimento: ${formattedDueDate}
  </p>
  <p>${textParts.greeting}</p>
  <p>${textParts.line1}</p>
  ${textParts.invoiceSourceDescription
      ? `<p style="font-size:14px;color:${brandConfig.colors.BLACK2};margin:0 0 20px;">
         ${textParts.invoiceSourceDescription}
       </p>`
      : ''}

  <!-- Financial Summary Table -->
  <table width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation"
         style="margin:20px 0;border-collapse:collapse;">
    <tr>
      <td style="color:${brandConfig.colors.BLACK2};">Subtotal:</td>
      <td style="text-align:right;">${formatToMZN(templateData.invoiceSubTotal)}</td>
    </tr>
    ${templateData.invoiceDiscount > 0 ? `
    <tr>
      <td style="color:${brandConfig.colors.BLACK2};">Desconto:</td>
      <td style="text-align:right;">-${formatToMZN(templateData.invoiceDiscount)}</td>
    </tr>` : ''}
    ${templateData.totalDeliveryFee && templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER ? `
    <tr>
      <td style="color:${brandConfig.colors.BLACK2};">Taxa de Entrega:</td>
      <td style="text-align:right;">${formatToMZN(templateData.totalDeliveryFee)}</td>
    </tr>` : ''}
    ${templateData.invoiceTotalTax > 0 ? `
    <tr>
      <td style="color:${brandConfig.colors.BLACK2};">IVA:</td>
      <td style="text-align:right;">${formatToMZN(templateData.invoiceTotalTax)}</td>
    </tr>` : ''}
    <tr>
      <td colspan="2">
        <hr style="border:none;border-top:1px solid ${brandConfig.colors.BLACK3};margin:5px 0;"/>
      </td>
    </tr>
    <tr>
      <td style="font-weight:bold;color:${brandConfig.colors.BLACK};">Total a Pagar:</td>
      <td style="text-align:right;font-weight:bold;color:${brandConfig.colors.PRIMARY};">
        ${formatToMZN(templateData.invoiceTotalAmount)}
      </td>
    </tr>
  </table>

  <p style="margin:10px 0;font-weight:bold;">
    Estado Atual:
    <span style="color:${templateData.invoiceStatus === InvoiceStatus.PAID ? brandConfig.colors.GREEN : (templateData.invoiceStatus === InvoiceStatus.PENDING_PAYMENT ? brandConfig.colors.ORANGE : brandConfig.colors.BLACK2)};">\`${convertInvoiceStatus(templateData.invoiceStatus)}\`</span>
  </p>
  ${templateData.paymentTerms ? `
  <p style="font-size:13px;color:${brandConfig.colors.BLACK2};margin:0 0 20px;">
    Termos: ${convertPaymentTermsType(templateData.paymentTerms)}
  </p>` : ''}

  ${generateEmailButton({ text: textParts.buttonTextPay, url: deepLink, brandConfig })}
  ${templateData.invoiceDocumentUrl && textParts.buttonTextDownloadPdf ? generateEmailButton({ text: textParts.buttonTextDownloadPdf, url: templateData.invoiceDocumentUrl, brandConfig, customBackgroundColor: brandConfig.colors.BLACK3, customTextColor: brandConfig.colors.BLACK }) : ''}

  <p style="font-size:13px;">
    Se tiver alguma dúvida,
    <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};text-decoration:none;">
      contacte o nosso suporte
    </a>.
  </p>
  <p>Obrigado,<br/>Equipa ${brandConfig.appName}</p>
`;

  htmlBody += generateEmailFooter({ brandConfig });

  // Plain-text body
  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1}\n`;
  textBody += `\nSumário Financeiro:\n- Subtotal: ${formatToMZN(templateData.invoiceSubTotal)}`;
  if (templateData.invoiceDiscount > 0) textBody += `\n- Desconto: -${formatToMZN(templateData.invoiceDiscount)}`;
  if (templateData.totalDeliveryFee && templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) {
    textBody += `\n- Taxa de Entrega: ${formatToMZN(templateData.totalDeliveryFee)}`;
  }
  if (templateData.invoiceTotalTax > 0) textBody += `\n- IVA: ${formatToMZN(templateData.invoiceTotalTax)}`;
  textBody += `\n- Total a Pagar: ${formatToMZN(templateData.invoiceTotalAmount)}`;
  textBody += `\n- Estado: ${convertInvoiceStatus(templateData.invoiceStatus)}`;
  if (templateData.paymentTerms) textBody += `\n- Termos: ${convertPaymentTermsType(templateData.paymentTerms)}`;
  textBody += `\n\n${textParts.buttonTextPay}: ${deepLink}`;
  if (templateData.invoiceDocumentUrl && textParts.buttonTextDownloadPdf) {
    textBody += `\n${textParts.buttonTextDownloadPdf}: ${templateData.invoiceDocumentUrl}`;
  }
  textBody += `\n\nSe tiver dúvidas, contacte o suporte: ${brandConfig.supportEmail}`;
  textBody += `\n\nObrigado,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: htmlBody,
    textBody,
  };
};