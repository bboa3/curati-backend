import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { DeliveryType, InvoiceSourceType, InvoiceStatus } from "../../../helpers/types/schema";
import { TemplateData } from "./schema";

export interface InvoiceStatusPatientTextParts {
  subject: string;
  emailTitle: string;
  title: string;
  greeting: string;
  line1: string;
  line2?: string;
  line3?: string;
  isWarning?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
  isNeutral?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export const getInvoiceStatusPatientTextParts = (data: TemplateData, appName: string): InvoiceStatusPatientTextParts => {
  const status = data.newInvoiceStatus;
  const sourceRef = data.invoiceSourceType === InvoiceSourceType.CONTRACT ? `Contrato #${data.contractNumber || ''} (${data.serviceName || ''})` : `Pedido #${data.orderNumber || ''}`;
  const formattedTotalAmount = formatToMZN(data.invoiceTotalAmount);

  switch (status) {
    case InvoiceStatus.PAID:
      const paymentDate = data.paymentOrActionDate ? formatDateTimeNumeric(data.paymentOrActionDate) : 'recentemente';
      let nextStepPaid = "";
      if (data.invoiceSourceType === InvoiceSourceType.CONTRACT) {
        nextStepPaid = `Com o pagamento confirmado, o seu serviço "${data.serviceName || ''}" ${data.professionalName ? `com ${data.professionalName}` : ''} pode prosseguir. Entraremos em contacto para finalizar detalhes, se necessário.`;
      } else if (data.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) {
        const deliveryText = data.deliveryType === DeliveryType.PICKUP ? "para retirada na farmácia." : "para entrega.";
        nextStepPaid = `A Farmácia ${data.pharmacyName || 'designada'} iniciará a preparação da sua encomenda. Receberá notificações sobre os próximos passos ${deliveryText}`;
      }
      return {
        subject: `${appName}: Pagamento Confirmado - Fatura #${data.invoiceNumber}`,
        emailTitle: "Pagamento Recebido com Sucesso!",
        title: "Pagamento Confirmado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Confirmamos o recebimento do seu pagamento para a fatura <strong>#${data.invoiceNumber}</strong> (${sourceRef}), no valor de <strong>${formattedTotalAmount}</strong>, em ${paymentDate}.`,
        line2: nextStepPaid,
        isPositive: true,
        primaryButtonText: "Ver Fatura Paga",
        secondaryButtonText: data.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER ? "Acompanhar Pedido" : "Ver Detalhes do Contrato",
      };

    case InvoiceStatus.FAILED:
      const dueDateFailed = data.invoiceDueDate ? formatDateTimeNumeric(data.invoiceDueDate) : 'indicada';
      let reasonFailed = data.failureReason ? `Motivo reportado: ${data.failureReason}.` : 'Pode dever-se a fundos insuficientes, dados inválidos ou recusa do banco.';
      return {
        subject: `${appName}: Falha no Pagamento - Fatura #${data.invoiceNumber}`,
        emailTitle: "Problema no Pagamento da Fatura",
        title: "Falha no Pagamento",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Lamentamos, mas falhou o processamento do pagamento da fatura <strong>#${data.invoiceNumber}</strong> (${sourceRef}), no valor de <strong>${formattedTotalAmount}</strong>. Vencimento original: ${dueDateFailed}.`,
        line2: reasonFailed,
        line3: `Para evitar interrupção do serviço ou cancelamento do pedido, por favor, regularize o pagamento.`,
        isNegative: true,
        primaryButtonText: "Tentar Pagamento Novamente",
        secondaryButtonText: "Atualizar Método de Pagamento",
      };

    case InvoiceStatus.PENDING_PAYMENT:
    case InvoiceStatus.AWAITING_PATIENT_REVIEW:
      const dueDatePending = data.invoiceDueDate ? formatDateTimeNumeric(data.invoiceDueDate) : 'breve';
      return {
        subject: `${appName}: Lembrete de Pagamento - Fatura #${data.invoiceNumber}`,
        emailTitle: `Lembrete: Fatura #${data.invoiceNumber} Aguarda Pagamento`,
        title: "Pagamento Pendente",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `A sua fatura Cúrati (Nº <strong>${data.invoiceNumber}</strong>) para ${sourceRef}, no valor de <strong>${formattedTotalAmount}</strong>, está pendente de pagamento.`,
        line2: `Data de Vencimento: ${dueDatePending}.`,
        line3: "Efectue o pagamento para continuar com o seu serviço ou pedido.",
        isNeutral: true, isWarning: true,
        primaryButtonText: "Efectuar Pagamento",
      };

    case InvoiceStatus.OVERDUE:
      const dueDateOverdue = data.invoiceDueDate ? formatDateTimeNumeric(data.invoiceDueDate) : 'anterior';
      return {
        subject: `${appName}: URGENTE - Fatura #${data.invoiceNumber} Vencida`,
        emailTitle: `URGENTE: Fatura #${data.invoiceNumber} Vencida`,
        title: "Fatura Vencida",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `A sua fatura Cúrati (Nº <strong>${data.invoiceNumber}</strong>) para ${sourceRef}, no valor de <strong>${formattedTotalAmount}</strong>, está vencida desde ${dueDateOverdue}.`,
        line2: "Por favor, regularize o pagamento imediatamente para evitar a suspensão de serviços ou cancelamento do pedido.",
        isNegative: true, isWarning: true,
        primaryButtonText: "Pagar Fatura Agora",
      };

    case InvoiceStatus.PARTIALLY_PAID:
      const remainingBalance = data.remainingBalance ? formatToMZN(data.remainingBalance) : '';
      const amountPaid = data.amountPaid ? formatToMZN(data.amountPaid) : '';
      return {
        subject: `${appName}: Pagamento Parcial Recebido - Fatura #${data.invoiceNumber}`,
        emailTitle: `Pagamento Parcial Recebido - Fatura #${data.invoiceNumber}`,
        title: "Pagamento Parcial",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Recebemos um pagamento parcial de <strong>${amountPaid}</strong> para a fatura <strong>#${data.invoiceNumber}</strong> (${sourceRef}).`,
        line2: `Valor restante: <strong>${remainingBalance}</strong>. Data de Vencimento: ${data.invoiceDueDate ? formatDateTimeNumeric(data.invoiceDueDate) : 'Verifique na fatura'}.`,
        line3: "Por favor, liquide o valor restante para completar o pagamento.",
        isNeutral: true, isWarning: true,
        primaryButtonText: "Pagar Valor Restante",
      };

    default:
      return {
        subject: `${appName}: Atualização da Fatura #${data.invoiceNumber}`,
        emailTitle: `Atualização da Fatura #${data.invoiceNumber}`,
        title: `Fatura: ${status}`,
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `O estado da sua fatura #${data.invoiceNumber} (${sourceRef}) foi atualizado para: <strong>${status}</strong>.`,
        isNeutral: true,
        primaryButtonText: "Ver Detalhes da Fatura",
      };
  }
};