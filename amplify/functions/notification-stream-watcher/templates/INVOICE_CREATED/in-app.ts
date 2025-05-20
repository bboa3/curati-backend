import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { InvoiceSourceType, InvoiceStatus, NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const isPendingPayment = templateData.invoiceStatus === InvoiceStatus.PENDING_PAYMENT || templateData.invoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW;

  let title = `Nova Fatura #${templateData.invoiceNumber}`;
  if (isPendingPayment) {
    title = `Pagamento Pendente: Fatura #${templateData.invoiceNumber}`;
  }

  let sourceInfo = "";
  if (templateData.invoiceSourceType === InvoiceSourceType.CONTRACT && templateData.serviceName) {
    sourceInfo = `Serviço: ${templateData.serviceName}`;
  } else if (templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER && templateData.orderNumber) {
    sourceInfo = `Pedido: #${templateData.orderNumber}`;
  }

  const shortMessage = `Fatura #${templateData.invoiceNumber} (${formatToMZN(templateData.invoiceTotalAmount)}) ${isPendingPayment ? `vence em ${formatDateTimeNumeric(templateData.invoiceDueDate)}` : 'disponível'}.`;

  let fullMessage = `A sua fatura nº ${templateData.invoiceNumber} no valor de ${formatToMZN(templateData.invoiceTotalAmount)} está ${isPendingPayment ? `pendente de pagamento e vence em ${formatDateTimeNumeric(templateData.invoiceDueDate)}` : 'disponível para consulta'}.`;
  if (sourceInfo) {
    fullMessage += `\nReferente a: ${sourceInfo}.`;
  }


  return {
    title,
    message: fullMessage,
    shortMessage,
  };
};