import { InvoiceSourceType, InvoiceStatus } from "../../../helpers/types/schema";
import { TemplateData } from "./schema";

export interface InvoiceCreatedTextParts {
  subject: string;
  emailTitle: string;
  title: string;
  greeting: string;
  line1: string;
  invoiceSourceDescription: string;
  buttonTextPay: string;
  buttonTextDownloadPdf?: string;
}

export const getInvoiceCreatedTextParts = (data: TemplateData, appName: string): InvoiceCreatedTextParts => {
  const isPendingPayment = data.invoiceStatus === InvoiceStatus.PENDING_PAYMENT || data.invoiceStatus === InvoiceStatus.AWAITING_PATIENT_REVIEW;
  const subjectAction = isPendingPayment ? "Pronta Para Pagamento" : "Disponível";

  let invoiceSourceDescription = "";
  if (data.invoiceSourceType === InvoiceSourceType.CONTRACT && data.contractNumber && data.serviceName) {
    invoiceSourceDescription = `Referente ao Contrato Nº <strong>${data.contractNumber}</strong> (${data.serviceName}).`;
  } else if (data.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER && data.orderNumber) {
    invoiceSourceDescription = `Referente ao seu Pedido de Medicamentos Nº <strong>${data.orderNumber}</strong>.`;
  }

  return {
    subject: `${appName}: Fatura #${data.invoiceNumber} ${subjectAction}`,
    emailTitle: `Sua Fatura Cúrati #${data.invoiceNumber}`,
    title: `Nova Fatura #${data.invoiceNumber}`,
    greeting: `Prezado(a) ${data.recipientName},`,
    line1: `A sua fatura Cúrati (Nº <strong>${data.invoiceNumber}</strong>) foi gerada e está ${isPendingPayment ? 'pronta para pagamento' : 'disponível para consulta'}.`,
    invoiceSourceDescription,
    buttonTextPay: isPendingPayment ? "Efectuar Pagamento Agora" : "Ver Fatura",
    buttonTextDownloadPdf: data.invoiceDocumentUrl ? "Ver/Descarregar Fatura (PDF)" : undefined,
  };
};