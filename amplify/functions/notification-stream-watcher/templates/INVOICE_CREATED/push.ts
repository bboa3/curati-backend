import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { InvoiceStatus, NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const isPendingPayment = templateData.invoiceStatus === InvoiceStatus.PENDING_PAYMENT || templateData.invoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW;

  const title = `${brandConfig.appName}: ${isPendingPayment ? 'Fatura Pronta para Pagamento' : 'Nova Fatura Disponível'}`;
  let body = `Fatura #${templateData.invoiceNumber} (${formatToMZN(templateData.invoiceTotalAmount)})`;
  if (isPendingPayment) {
    body += ` vence em ${formatDateTimeNumeric(templateData.invoiceDueDate)}. Toque para pagar.`;
  } else {
    body += ` está disponível. Toque para ver.`;
  }

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};