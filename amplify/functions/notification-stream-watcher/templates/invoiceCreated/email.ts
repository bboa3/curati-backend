import { formatDateTimeNumeric } from '../../../helpers/date/formatter';
import { formatToMZN } from '../../../helpers/number-formatter';
import { InvoiceSourceType, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { convertInvoiceStatus } from '../../helpers/enum/invoice-status';
import { convertPaymentTermsType } from '../../helpers/enum/payment-terms';
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getInvoiceCreatedTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getInvoiceCreatedTextParts(templateData, brandConfig.appName);

  const formattedInvoiceDate = formatDateTimeNumeric(templateData.invoiceCreatedAt);
  const formattedDueDate = formatDateTimeNumeric(templateData.invoiceDueDate);

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

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: `
    <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${textParts.subject}</title>
      </head>
    <body>
            <div class="container">
              <p>Se tiver alguma questão, por favor contacte o suporte Cúrati.</p>
              <p>Lamentamos qualquer inconveniente.</p>
              <p>Atenciosamente,</p>
              <p><strong>Equipa Cúrati Saúde</strong></p>
            </div>
          </body>
          </html>
    `,
    textBody,
  };
};