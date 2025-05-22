import { formatTime } from "../../../helpers/date/formatter";
import { DeliveryStatus } from "../../../helpers/types/schema";
import { TemplateData } from "./schema";

export interface DriverStatusTextParts {
  subjectSuffix: string;
  emailTitle: string;
  title: string;
  line1: string;
  line2?: string;
  line3?: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  isNegative?: boolean;
  primaryButtonText?: string;
}

export const getDriverDeliveryStatusTextParts = (data: TemplateData): DriverStatusTextParts => {
  const status = data.newDeliveryStatus as DeliveryStatus;
  const deliveryRef = `(Entrega #${data.deliveryNumber} / Pedido #${data.orderNumber})`;

  switch (status) {
    case DeliveryStatus.PICKED_UP_BY_DRIVER:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Recolhida`,
        emailTitle: "Recolha da Entrega Confirmada",
        title: "Recolha Confirmada",
        line1: `Confirmou a recolha da entrega #${data.deliveryNumber} de ${data.pharmacyName || 'farmácia'}.`,
        line2: data.patientAddressSnippet ? `Próximo passo: Entregar em ${data.patientAddressSnippet}. Consulte a app para a rota.` : "Consulte a app para os detalhes da entrega.",
        isPositive: true, primaryButtonText: "Ver Rota e Detalhes",
      };
    case DeliveryStatus.IN_TRANSIT:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Marcada Como Em Trânsito`,
        emailTitle: "Entrega em Trânsito",
        title: "Em Trânsito",
        line1: `A sua entrega #${data.deliveryNumber} para ${data.patientNameForContext || 'o paciente'} está agora marcada como "Em Trânsito".`,
        line2: "Boa viagem! Mantenha a app atualizada.",
        isPositive: true, primaryButtonText: "Ver Detalhes da Rota",
      };
    case DeliveryStatus.DELIVERED:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Concluída!`,
        emailTitle: "Entrega Concluída com Sucesso!",
        title: "Entrega Concluída!",
        line1: `Excelente trabalho! Confirmou a entrega #${data.deliveryNumber} para ${data.patientNameForContext || 'o paciente'} ${data.actionTimestamp ? `às ${formatTime(data.actionTimestamp)}` : ''}.`,
        line2: "Esta tarefa está finalizada. Pode verificar os seus ganhos e próximas oportunidades na app.",
        isPositive: true, primaryButtonText: "Ver Minhas Entregas",
      };
    case DeliveryStatus.FAILED:
      return {
        subjectSuffix: `Falha na Entrega #${data.deliveryNumber}`,
        emailTitle: "Problema Reportado na Entrega",
        title: "Falha na Entrega",
        line1: `A entrega #${data.deliveryNumber} foi marcada como falhada.`,
        line2: data.statusReason ? `Motivo reportado: ${data.statusReason}.` : (data.nextStepInstruction || "Aguarde instruções do suporte ou contacte-nos se necessário."),
        isNegative: true, primaryButtonText: "Ver Detalhes/Contactar Suporte",
      };
    case DeliveryStatus.CANCELLED:
      return {
        subjectSuffix: `ATENÇÃO: Entrega #${data.deliveryNumber} Cancelada`,
        emailTitle: "Entrega Atribuída Foi Cancelada!",
        title: "Entrega Cancelada!",
        line1: `Atenção: A entrega #${data.deliveryNumber} ${deliveryRef} que lhe foi atribuída foi cancelada.`,
        line2: data.statusReason ? `Motivo: ${data.statusReason}.` : "",
        line3: data.nextStepInstruction || "Por favor, não prossiga com esta entrega. Verifique a app para mais detalhes ou contacte o suporte se já tiver recolhido o pedido.",
        isNegative: true, primaryButtonText: "Ver Minhas Tarefas",
      };
    case DeliveryStatus.DRIVER_ASSIGNED:
      return {
        subjectSuffix: `Nova Atribuição: Entrega #${data.deliveryNumber}`,
        emailTitle: "Nova Entrega Atribuída!",
        title: "Entrega Atribuída",
        line1: `A entrega #${data.deliveryNumber} foi atribuída a si.`,
        line2: `Recolha em: ${data.pharmacyName || 'N/A'} (${data.pharmacyAddressSnippet || 'N/A'}). Entregar a: ${data.patientAddressSnippet || 'N/A'}.`,
        line3: "Consulte a app Cúrati Go para todos os detalhes e para iniciar.",
        isPositive: true, primaryButtonText: "Ver Detalhes na App",
      };
    default:
      return {
        subjectSuffix: `Atualização Entrega #${data.deliveryNumber}`,
        emailTitle: `Atualização da Entrega: ${status}`,
        title: `Entrega: ${status}`,
        line1: `O estado da sua entrega #${data.deliveryNumber} ${deliveryRef} foi atualizado para: ${status}.`,
        line2: data.nextStepInstruction || "Verifique a aplicação Cúrati Go para mais detalhes.",
        isNeutral: true, primaryButtonText: "Ver na App Cúrati Go",
      };
  }
};