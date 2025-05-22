import { formatToMZN } from "../../../helpers/number-formatter";
import { InvoiceStatus, NotificationChannel, NotificationPayload, Priority } from "../../../helpers/types/schema";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getInvoiceStatusPatientTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' })
  const textParts = getInvoiceStatusPatientTextParts(templateData, brandConfig.appName);
  const title = `${brandConfig.appName}: ${textParts.title} (#${templateData.invoiceNumber})`;
  let body = `Fatura #${templateData.invoiceNumber} (${formatToMZN(templateData.invoiceTotalAmount)}) - ${textParts.line1.replace(/<strong>|<\/strong>/g, '').split('.')[0]}.`;
  if (templateData.newInvoiceStatus === InvoiceStatus.FAILED) body += ` Ação necessária!`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};