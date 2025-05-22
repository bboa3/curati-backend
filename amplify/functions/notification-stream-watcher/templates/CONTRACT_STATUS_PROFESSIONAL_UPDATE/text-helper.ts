import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { ContractStatus, ContractType } from "../../../helpers/types/schema";
import { convertContractType } from "../../helpers/enum/contractType";
import { TemplateData } from "./schema";

export interface ContractProfessionalTextParts {
  subject: string;
  emailTitle: string;
  title: string;
  greeting: string;
  line1: string;
  line2Context?: string;
  line3ActionOrInfo?: string;
  isActionRequired?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
  isNeutral?: boolean;
  primaryButtonText?: string;
}

export const getContractStatusProfessionalTextParts = (data: TemplateData, appNamePro: string): ContractProfessionalTextParts => {
  const status = data.newContractStatus as ContractStatus;
  const contractRef = `Contrato Nº ${data.contractNumber}`;
  const serviceContext = `serviço "${data.serviceName}" para o(a) paciente ${data.patientName}`;
  const contractTypeInfo = convertContractType(data.contractType as ContractType);

  switch (status) {
    case ContractStatus.PENDING_CONFIRMATION:
      return {
        subject: `${appNamePro}: Ação Necessária - Confirmar ${contractRef}`,
        emailTitle: "Confirmação de Novo Contrato de Serviço",
        title: "Confirmar Novo Contrato",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Um novo ${contractTypeInfo} (${contractRef}) para o ${serviceContext} foi submetido e aguarda a sua confirmação para ser ativado.`,
        line2Context: `Tipo: ${contractTypeInfo}. Serviço: ${data.serviceName}. Paciente: ${data.patientName}.`,
        line3ActionOrInfo: `A sua confirmação é essencial. ${data.confirmationDueDate ? `Por favor, confirme até ${formatDateTimeNumeric(data.confirmationDueDate)}.` : 'Confirme o mais breve possível.'}`,
        isActionRequired: true, primaryButtonText: "Rever e Confirmar Contrato",
      };
    case ContractStatus.ACTIVE:
      return {
        subject: `${appNamePro}: ${contractRef} Ativado`,
        emailTitle: "Contrato Ativado com Sucesso!",
        title: "Contrato Ativo",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `O ${contractTypeInfo} (${contractRef}) para o ${serviceContext} está agora ATIVO.`,
        line2Context: `${data.contractStartDate ? `Data de início: ${formatDateTimeNumeric(data.contractStartDate)}. ` : ''}${data.contractEndDate ? `Válido até: ${formatDateTimeNumeric(data.contractEndDate)}.` : ''}`,
        line3ActionOrInfo: data.additionalMessage || "Pode agora prosseguir com os serviços agendados sob este contrato.",
        isPositive: true, primaryButtonText: "Ver Detalhes do Contrato",
      };
    case ContractStatus.EXPIRED:
      return {
        subject: `${appNamePro}: ${contractRef} Expirou`,
        emailTitle: "Um Contrato Expirou",
        title: "Contrato Expirado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Informamos que o ${contractTypeInfo} (${contractRef}) para o ${serviceContext} expirou em ${data.contractEndDate ? formatDateTimeNumeric(data.contractEndDate) : 'data recente'}.`,
        line2Context: data.additionalMessage || "Considere contactar o(a) paciente ${data.patientName} para discutir a renovação ou um novo contrato, se aplicável.",
        isNeutral: true, primaryButtonText: "Ver Contrato Expirado",
      };
    case ContractStatus.TERMINATED:
      return {
        subject: `${appNamePro}: ${contractRef} Foi Terminado`,
        emailTitle: "Um Contrato Foi Terminado",
        title: "Contrato Terminado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `O ${contractTypeInfo} (${contractRef}) para o ${serviceContext} foi terminado.`,
        line2Context: `${data.terminatedBy ? `Terminado por: ${data.terminatedBy}. ` : ''}${data.terminationReason ? `Motivo: ${data.terminationReason}.` : ''}`,
        line3ActionOrInfo: data.additionalMessage || "Os serviços sob este contrato não devem mais ser prestados. O seu horário foi atualizado.",
        isNegative: true, primaryButtonText: "Ver Detalhes do Contrato",
      };
    case ContractStatus.REJECTED:
      return {
        subject: `${appNamePro}: ${contractRef} Rejeitado/Não Prossegue`,
        emailTitle: "Contrato Não Pôde Ser Ativado",
        title: "Contrato Rejeitado",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `Informamos que o ${contractTypeInfo} (${contractRef}) para o ${serviceContext} não pôde ser ativado ou foi rejeitado.`,
        line2Context: data.rejectionReason ? `Motivo: ${data.rejectionReason}.` : "O contrato não prosseguirá.",
        line3ActionOrInfo: data.additionalMessage || "Consulte a plataforma para mais detalhes ou contacte o suporte.",
        isNegative: true, primaryButtonText: "Ver Detalhes",
      };
    case ContractStatus.PENDING_PAYMENT:
      return {
        subject: `${appNamePro}: ${contractRef} Aguarda Pagamento do Paciente`,
        emailTitle: "Contrato Aguarda Pagamento do Paciente",
        title: "Contrato: Pagamento Pendente (Paciente)",
        greeting: `Prezado(a) ${data.recipientName},`,
        line1: `O ${contractTypeInfo} (${contractRef}) para o ${serviceContext} foi confirmado por si e aguarda agora o pagamento por parte do(a) paciente ${data.patientName}.`,
        line2Context: "Será notificado(a) assim que o contrato for ativado após o pagamento.",
        isNeutral: true, primaryButtonText: "Ver Detalhes do Contrato",
      };
    default:
      return { subject: `${appNamePro}: Atualização do ${contractRef}`, emailTitle: `Atualização do Contrato #${data.contractNumber}`, title: `Contrato: ${status}`, greeting: `Prezado(a) ${data.recipientName},`, line1: `O estado do ${contractRef} foi atualizado para ${status}.`, isNeutral: true, primaryButtonText: "Ver Contrato" };
  }
};