import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { formatToMZN } from "../../../helpers/number-formatter";
import { ContractStatus } from "../../../helpers/types/schema";
import { convertContractType } from "../../helpers/enum/contractType";
import { TemplateData } from "./schema";

export interface ContractPatientTextParts {
  subject: string;
  emailTitle: string;
  title: string;
  greeting: string;
  line1: string;
  line2?: string;
  line3?: string;
  line4?: string;
  isNeutral?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
  isWarning?: boolean;
  primaryButtonText?: string;
}

export const getContractStatusPatientTextParts = (data: TemplateData, appName: string): ContractPatientTextParts => {
  const status = data.newContractStatus;
  const contractRef = `Contrato Nº ${data.contractNumber}`;
  const serviceInfo = `"${data.serviceName}"${data.professionalName ? ` com ${data.professionalName}` : ''}`;
  const contractTypeInfo = convertContractType(data.contractType);

  switch (status) {
    case ContractStatus.ACTIVE:
      if (data.invoiceNumber && data.invoiceTotalAmount !== undefined && data.invoiceDueDate) {
        const formattedDueDate = formatDateTimeNumeric(data.invoiceDueDate);
        const formattedTotalAmount = formatToMZN(data.invoiceTotalAmount);
        return {
          subject: `${appName}: ${contractRef} Confirmado - Fatura Pronta!`,
          emailTitle: "Contrato Confirmado e Fatura Pronta!",
          title: "Contrato Confirmado!",
          greeting: `Prezado(a) ${data.recipientName},`,
          line1: `Excelente notícia! O seu ${contractTypeInfo} ${contractRef} para ${serviceInfo} foi confirmado com sucesso.`,
          line2: `Para dar seguimento, a fatura referente a este serviço já se encontra disponível para pagamento.`,
          line3: `<strong>Fatura Nº:</strong> ${data.invoiceNumber} | <strong>Valor:</strong> ${formattedTotalAmount} | <strong>Vence em:</strong> ${formattedDueDate}.`,
          line4: data.additionalMessage || "O pagamento desta fatura é o próximo passo para podermos agendar o(s) seu(s) serviço(s).",
          isPositive: true,
          primaryButtonText: "Ver Fatura e Pagar Agora",
        };
      } else {
        return {
          subject: `${appName}: ${contractRef} Ativado!`,
          emailTitle: "O Seu Contrato Está Ativo!",
          title: "Contrato Ativo",
          greeting: `Prezado(a) ${data.recipientName},`,
          line1: `Boas notícias! O seu ${contractTypeInfo} ${contractRef} para ${serviceInfo} está agora ATIVO.`,
          line2: `${data.contractStartDate ? `Data de início: ${formatDateTimeNumeric(data.contractStartDate)}. ` : ''}${data.nextRenewalDate ? `Válido até: ${formatDateTimeNumeric(data.nextRenewalDate)}.` : ''}`,
          line3: data.additionalMessage || "Pode começar a agendar os seus serviços conforme os termos do contrato.",
          isPositive: true, primaryButtonText: "Ver Detalhes do Contrato",
        };
      }

    case ContractStatus.PENDING_PAYMENT:
      return {
        subject: `${appName}: Pagamento Pendente - ${contractRef}`,
        emailTitle: "Pagamento Necessário para Contrato",
        title: "Contrato: Pagamento Pendente",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `O seu ${contractTypeInfo} para ${serviceInfo} (${contractRef}) requer um pagamento para ser ativado ou para continuar.`,
        line2: `Valor: ${formatToMZN(data.invoiceTotalAmount || 0) || 'Consulte a fatura associada'}. ${data.invoiceDueDate ? `Vence em: ${formatDateTimeNumeric(data.invoiceDueDate)}.` : ''}`,
        line3: data.additionalMessage || "Por favor, efectue o pagamento através da plataforma.",
        isWarning: true, primaryButtonText: "Efectuar Pagamento",
      };

    case ContractStatus.PENDING_CONFIRMATION:
      return {
        subject: `${appName}: ${contractRef} Aguarda Confirmação`,
        emailTitle: "Seu Pedido de Contrato Aguarda Confirmação",
        title: "Contrato Aguarda Confirmação",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `A sua solicitação para o ${contractTypeInfo} "${serviceInfo}" (${contractRef}) foi recebida.`,
        line2: `Aguardamos a confirmação ${data.professionalName ? `de ${data.professionalName}` : 'interna'}. Será notificado(a) assim que o estado for atualizado.`,
        isNeutral: true, primaryButtonText: "Ver Detalhes da Solicitação",
      };

    case ContractStatus.EXPIRED:
      return {
        subject: `${appName}: ${contractRef} Expirou`,
        emailTitle: "O Seu Contrato Expirou",
        title: "Contrato Expirado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Informamos que o seu ${contractTypeInfo} para ${serviceInfo} (${contractRef}) expirou em ${data.nextRenewalDate ? formatDateTimeNumeric(data.nextRenewalDate) : 'data recente'}.`,
        line2: data.additionalMessage || "Se desejar continuar com os serviços, por favor, inicie um novo contrato ou contacte o suporte.",
        isNeutral: true, primaryButtonText: "Renovar ou Ver Opções",
      };

    case ContractStatus.TERMINATED:
      return {
        subject: `${appName}: Atualização Sobre o ${contractRef}`,
        emailTitle: "Contrato Terminado",
        title: "Contrato Terminado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Lamentamos informar que o seu ${contractTypeInfo} para ${serviceInfo} (${contractRef}) foi <strong>TERMINADO</strong>.`,
        line2: `${data.terminatedBy ? `Terminado por: ${data.terminatedBy}. ` : ''}${data.terminationReason ? `Motivo: ${data.terminationReason}.` : 'O contrato não está mais ativo.'}`,
        line3: data.additionalMessage || "Para mais detalhes ou para discutir os próximos passos, por favor, entre em contacto com a nossa equipa de suporte.",
        isNegative: true, primaryButtonText: "Contactar Suporte",
      };

    case ContractStatus.REJECTED:
      return {
        subject: `${appName}: Atualização Sobre o ${contractRef}`,
        emailTitle: "Proposta de Contrato Não Aprovada", // More direct
        title: "Contrato Rejeitado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Informamos que a proposta para o ${contractTypeInfo} "${serviceInfo}" (${contractRef}) tem o estado: <strong>REJEITADO</strong>.`,
        line2: data.rejectionReason ? `Motivo: ${data.rejectionReason}.` : "Infelizmente, a proposta não pôde ser ativada.",
        line3: data.additionalMessage || "Para mais detalhes, por favor, contacte o nosso suporte.",
        isNegative: true, primaryButtonText: "Contactar Suporte",
      };
    default:
      return { subject: `${appName}: Atualização do ${contractRef}`, emailTitle: `Atualização do Contrato #${data.contractNumber}`, title: `Contrato: ${status}`, greeting: `Prezado(a) ${data.recipientName},`, line1: `O estado do seu ${contractRef} foi atualizado para ${status}.`, isNeutral: true, primaryButtonText: "Ver Detalhes" };
  }
};