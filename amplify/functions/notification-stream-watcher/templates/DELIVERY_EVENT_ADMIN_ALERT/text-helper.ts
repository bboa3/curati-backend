import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { DeliveryStatus } from "../../../helpers/types/schema";
import { TemplateData } from "./schema";

export interface AdminAlertTextParts {
  subjectSuffix: string;
  emailTitle: string;
  title: string;
  line1: string;
  line2?: string;
  line3?: string;
  isCritical?: boolean;
  isNegative?: boolean;
  isWarning?: boolean;
  isInfo?: boolean;
  isPositive?: boolean;
  primaryButtonText?: string;
}

export const getAdminDeliveryAlertTextParts = (data: TemplateData): AdminAlertTextParts => {
  const status = data.eventDeliveryStatus;
  const deliveryRef = `Entrega #${data.deliveryNumber} (Pedido #${data.orderNumber})`;
  const eventTime = formatDateTimeNumeric(data.eventTimestamp);
  const context = `Paciente: ${data.patientName || 'N/A'}, Motorista: ${data.driverName || 'N/A'}, Farmácia: ${data.pharmacyName || 'N/A'}.`;

  switch (status) {
    case DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Aguarda Motorista`,
        emailTitle: "Alerta: Entrega Aguarda Atribuição de Motorista",
        title: "Entrega Aguarda Motorista",
        line1: `${deliveryRef} está pronta na ${data.pharmacyName || 'farmácia'} e aguarda atribuição de motorista desde ${eventTime}.`,
        line2: data.statusReason || "Verificar se existem motoristas disponíveis ou se é necessária intervenção manual.",
        isWarning: true, primaryButtonText: "Ver no Dashboard de Entregas",
      };
    case DeliveryStatus.DRIVER_ASSIGNED:
      return {
        subjectSuffix: `Motorista Designado para Entrega #${data.deliveryNumber}`,
        emailTitle: "Info: Motorista Designado",
        title: "Motorista Designado",
        line1: `O motorista ${data.driverName || 'N/A'} foi designado para a ${deliveryRef} às ${eventTime}.`,
        line2: context,
        isInfo: true, primaryButtonText: "Ver Detalhes da Entrega",
      };
    case DeliveryStatus.PICKED_UP_BY_DRIVER:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Recolhida`,
        emailTitle: "Info: Entrega Recolhida pelo Motorista",
        title: "Entrega Recolhida",
        line1: `O motorista ${data.driverName || 'N/A'} recolheu a ${deliveryRef} de ${data.pharmacyName || 'farmácia'} às ${eventTime}.`,
        isInfo: true, primaryButtonText: "Acompanhar Entrega",
      };
    case DeliveryStatus.IN_TRANSIT:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} em Trânsito`,
        emailTitle: "Info: Entrega em Trânsito",
        title: "Entrega em Trânsito",
        line1: `A ${deliveryRef} está em trânsito com ${data.driverName || 'N/A'} desde ${eventTime}.`,
        line2: data.statusReason,
        isInfo: !data.statusReason?.includes("atrasada"),
        isWarning: data.statusReason?.includes("atrasada"),
        primaryButtonText: "Acompanhar Entrega",
      };
    case DeliveryStatus.DELIVERED:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Concluída`,
        emailTitle: "Info: Entrega Concluída com Sucesso",
        title: "Entrega Concluída",
        line1: `A ${deliveryRef} foi marcada como entregue por ${data.driverName || 'N/A'} às ${eventTime}.`,
        line2: context,
        isPositive: true, primaryButtonText: "Ver Registo da Entrega",
      };
    case DeliveryStatus.AWAITING_PATIENT_PICKUP:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Pronto para Retirada`,
        emailTitle: "Info: Pedido Pronto para Retirada (Click & Collect)",
        title: "Pronto para Retirada",
        line1: `O pedido ${data.orderNumber} está pronto para retirada pelo paciente ${data.patientName || ''} na ${data.pharmacyName || 'farmácia'} desde ${eventTime}.`,
        isInfo: true, primaryButtonText: "Ver Detalhes do Pedido",
      };
    case DeliveryStatus.PICKED_UP_BY_PATIENT:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Retirado pelo Paciente`,
        emailTitle: "Info: Pedido Retirado pelo Paciente (Click & Collect)",
        title: "Pedido Retirado",
        line1: `O paciente ${data.patientName || ''} retirou o pedido ${data.orderNumber} da ${data.pharmacyName || 'farmácia'} às ${eventTime}.`,
        isPositive: true, primaryButtonText: "Ver Registo do Pedido",
      };
    case DeliveryStatus.CANCELLED:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} CANCELADA`,
        emailTitle: "Alerta: Entrega Cancelada",
        title: "Entrega Cancelada",
        line1: `A ${deliveryRef} foi CANCELADA às ${eventTime}.`,
        line2: `Cancelada por: ${data.statusReason || 'Não especificado'}. ${context}`, // statusReason here is who cancelled and why
        line3: "Rever impacto e necessidade de seguimento.",
        isWarning: true, isNegative: true, primaryButtonText: "Analisar Cancelamento",
      };
    case DeliveryStatus.FAILED:
      return {
        subjectSuffix: `ALERTA CRÍTICO: Falha na Entrega #${data.deliveryNumber}`,
        emailTitle: "ALERTA CRÍTICO: Falha na Tentativa de Entrega",
        title: "Falha na Entrega",
        line1: `Falha ao tentar entregar a ${deliveryRef} às ${eventTime}!`,
        line2: `Motivo reportado: ${data.statusReason || 'Não especificado'}. ${context}`,
        line3: "Ação imediata pode ser necessária para contactar o paciente ou motorista.",
        isCritical: true, isNegative: true, primaryButtonText: "INVESTIGAR FALHA",
      };
    case DeliveryStatus.PENDING: // Usually not an alert unless stuck
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Pendente Incomum`,
        emailTitle: "Atenção: Entrega Pendente por Tempo Incomum",
        title: "Entrega Pendente",
        line1: `A ${deliveryRef} continua no estado PENDENTE desde ${eventTime}.`,
        line2: data.statusReason || "Verificar se há algum bloqueio no processamento.",
        isWarning: true, primaryButtonText: "Verificar Entrega",
      };
    default:
      return { subjectSuffix: `Atualização Entrega #${data.deliveryNumber}: ${status}`, emailTitle: `Atualização da Entrega: ${status}`, title: `Entrega: ${status}`, line1: `Estado da ${deliveryRef} mudou para ${status} às ${eventTime}.`, line2: context, isInfo: true, primaryButtonText: "Ver Detalhes" };
  }
};