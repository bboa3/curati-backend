import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { InvoiceStatus, NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';
import { getInvoiceStatusPatientTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const textParts = getInvoiceStatusPatientTextParts(templateData, "Cúrati");
  const title = `${textParts.title} - Fatura #${templateData.invoiceNumber}`;

  let shortMsg = `Fatura #${templateData.invoiceNumber} (${formatToMZN(templateData.invoiceTotalAmount)}) `;
  if (templateData.newInvoiceStatus === InvoiceStatus.PAID) shortMsg += `PAGA.`;
  else if (templateData.newInvoiceStatus === InvoiceStatus.FAILED) shortMsg += `FALHOU. Ação necessária.`;
  else if (templateData.newInvoiceStatus === InvoiceStatus.PENDING_PAYMENT || templateData.newInvoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW) shortMsg += `Pendente - Vence: ${formatDateTimeNumeric(templateData.invoiceDueDate!)}.`;
  else shortMsg += `Estado: ${templateData.newInvoiceStatus}.`;

  let fullMsg = `${textParts.line1.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line2) fullMsg += `\n${textParts.line2.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line3) fullMsg += `\n${textParts.line3.replace(/<strong>|<\/strong>/g, '')}`;

  return {
    title,
    message: fullMsg,
    shortMessage: shortMsg,
  };
};