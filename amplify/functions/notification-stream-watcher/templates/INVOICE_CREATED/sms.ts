import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { InvoiceStatus, NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;

  const formattedDueDate = formatDateTimeNumeric(templateData.invoiceDueDate);

  const isPendingPayment = templateData.invoiceStatus === 'PENDING_PAYMENT' || templateData.invoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW;


  let body = `${header}Nova fatura #${templateData.invoiceNumber} (${formatToMZN(templateData.invoiceTotalAmount)}) `;
  if (isPendingPayment) {
    body += `vence em ${formattedDueDate}. `;
  } else {
    body += `disponível. `;
  }
  body += `Pagar/Ver: ${deepLink}`;

  return {
    phoneNumbers: channel.targets,
    body: body.substring(0, 160),
  };
};