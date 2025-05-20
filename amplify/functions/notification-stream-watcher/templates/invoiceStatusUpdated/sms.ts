import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { InvoiceStatus, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';
import { getInvoiceStatusPatientTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const textParts = getInvoiceStatusPatientTextParts(templateData, brandConfig.appName);
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;

  const formattedDueDate = formatDateTimeNumeric(templateData.invoiceDueDate);

  let body = `${header}Fatura #${templateData.invoiceNumber}: ${textParts.title}. `;
  if (templateData.newInvoiceStatus === InvoiceStatus.PAID) {
    body += `Pagamento de ${formatToMZN(templateData.invoiceTotalAmount)} confirmado.`;
  } else if (templateData.newInvoiceStatus === InvoiceStatus.FAILED) {
    body += `Falha no pagamento de ${formatToMZN(templateData.invoiceTotalAmount)}. Ação necessária.`;
  } else if (templateData.newInvoiceStatus === InvoiceStatus.PENDING_PAYMENT || templateData.newInvoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW) {
    body += `Valor ${formatToMZN(templateData.invoiceTotalAmount)} vence em ${formattedDueDate}.`;
  }
  if (deepLink && textParts.primaryButtonText && (body.length + deepLink.length + textParts.primaryButtonText.length < 155)) {
    body += ` ${textParts.primaryButtonText.split(' ')[0]}: ${deepLink}`;
  }
  return { phoneNumbers: channel.targets, body: body.substring(0, 160) };
};