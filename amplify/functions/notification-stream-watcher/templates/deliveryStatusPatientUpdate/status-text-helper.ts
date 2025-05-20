import { formatETA, formatTime } from "../../../helpers/date/formatter";
import { DeliveryStatus } from "../../../helpers/types/schema";
import { TemplateData } from "./schema";

export interface PatientStatusTextParts {
  subjectSuffix: string;
  emailTitle: string;
  title: string;
  line1: string;
  line2?: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  isNegative?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export const getPatientDeliveryStatusTextParts = (data: TemplateData): PatientStatusTextParts => {
  const eta = formatETA(data.actionTimestamp, data.estimatedDeliveryDurationMinutes || 0);
  const status = data.newDeliveryStatus as DeliveryStatus;
  const orderRefText = `(Pedido #${data.orderNumber} / Entrega #${data.deliveryNumber})`;

  switch (status) {
    case DeliveryStatus.PHARMACY_PREPARING:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} em Preparação`,
        emailTitle: "O Seu Pedido Está em Preparação",
        title: "Pedido em Preparação",
        line1: `A ${data.pharmacyName || 'farmácia'} está a preparar o seu pedido ${orderRefText}.`,
        line2: "Receberá uma nova notificação assim que estiver pronto para o motorista ou para retirada.",
        isPositive: true, primaryButtonText: "Ver Estado do Pedido",
      };
    case DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Aguarda Motorista`,
        emailTitle: "O Seu Pedido Aguarda Motorista",
        title: "Aguarda Motorista",
        line1: `O seu pedido ${orderRefText} está pronto na ${data.pharmacyName || 'farmácia'} e aguarda a designação de um motorista.`,
        isNeutral: true, primaryButtonText: "Ver Estado do Pedido",
      };
    case DeliveryStatus.DRIVER_ASSIGNED:
      return {
        subjectSuffix: `Motorista Designado para Pedido #${data.orderNumber}`,
        emailTitle: "Motorista Designado",
        title: "Motorista Designado",
        line1: `${data.driverName || 'Um motorista'} foi designado e irá recolher o seu pedido ${orderRefText} em ${data.pharmacyName || 'breve'}.`,
        isPositive: true, primaryButtonText: "Acompanhar Entrega",
      };
    case DeliveryStatus.PICKED_UP_BY_DRIVER:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Recolhido!`,
        emailTitle: "Encomenda Recolhida e a Caminho!",
        title: "Encomenda a Caminho!",
        line1: `${data.driverName || 'O motorista'} recolheu o seu pedido ${orderRefText} na ${data.pharmacyName || 'farmácia'}.`,
        line2: eta ? `Estimativa de chegada hoje às ${eta}.` : "Acompanhe na app para a estimativa atualizada.",
        isPositive: true, primaryButtonText: "Acompanhar ao Vivo",
      };
    case DeliveryStatus.IN_TRANSIT:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} em Trânsito`,
        emailTitle: "Encomenda em Trânsito!",
        title: "Encomenda em Trânsito",
        line1: `O seu pedido ${orderRefText} com ${data.driverName || 'o motorista'} está em trânsito para si.`,
        line2: eta ? `Estimativa de chegada hoje às ${eta}. Prepare-se para receber!` : "Acompanhe na app!",
        isPositive: true, primaryButtonText: "Acompanhar ao Vivo",
      };
    case DeliveryStatus.DELIVERED:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Entregue!`,
        emailTitle: "Entrega Concluída com Sucesso!",
        title: "Entrega Concluída!",
        line1: `Boas notícias! O seu pedido ${orderRefText} foi entregue ${data.actionTimestamp ? `às ${formatTime(data.actionTimestamp)}` : ''}.`,
        line2: "Obrigado por escolher a Cúrati! A sua opinião é muito importante para nós.",
        isPositive: true, primaryButtonText: "Avaliar Entrega", secondaryButtonText: "Ver Detalhes do Pedido"
      };
    case DeliveryStatus.AWAITING_PATIENT_PICKUP:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Pronto para Retirada!`,
        emailTitle: "O Seu Pedido Está Pronto para Retirada!",
        title: "Pronto para Retirada",
        line1: `O seu pedido ${orderRefText} está pronto para ser retirado na ${data.pharmacyName || 'farmácia'}.`,
        line2: data.pharmacyAddressSnippet ? `Endereço: ${data.pharmacyAddressSnippet}. Verifique o horário de funcionamento.` : "Consulte a app para detalhes e horário.",
        isPositive: true, primaryButtonText: "Ver Detalhes da Retirada",
      };
    case DeliveryStatus.PICKED_UP_BY_PATIENT:
      return {
        subjectSuffix: `Pedido #${data.orderNumber} Retirado!`,
        emailTitle: "Pedido Retirado por Si!",
        title: "Pedido Retirado",
        line1: `Confirmamos que o seu pedido ${orderRefText} foi retirado da ${data.pharmacyName || 'farmácia'} ${data.actionTimestamp ? `às ${formatTime(data.actionTimestamp)}` : ''}.`,
        line2: "Obrigado por utilizar os nossos serviços!",
        isPositive: true, primaryButtonText: "Ver Detalhes do Pedido",
      };
    case DeliveryStatus.CANCELLED:
      return {
        subjectSuffix: `Entrega #${data.deliveryNumber} Cancelada`,
        emailTitle: "Entrega Cancelada",
        title: "Entrega Cancelada",
        line1: `A entrega #${data.deliveryNumber} (Pedido #${data.orderNumber}) foi cancelada.`,
        line2: data.cancellationReason ? `Motivo: ${data.cancellationReason}.` : "Para mais informações, por favor, contacte o nosso suporte.",
        isNegative: true, primaryButtonText: "Contactar Suporte",
      };
    case DeliveryStatus.FAILED:
      return {
        subjectSuffix: `Falha na Entrega #${data.deliveryNumber}`,
        emailTitle: "Falha na Tentativa de Entrega",
        title: "Falha na Entrega",
        line1: `Lamentamos, mas ocorreu um problema com a entrega #${data.deliveryNumber} (Pedido #${data.orderNumber}).`,
        line2: data.failureReason ? `Motivo: ${data.failureReason}.` : "A nossa equipa de suporte irá contactá-lo(a) em breve ou, se preferir, pode contactar-nos.",
        isNegative: true, primaryButtonText: "Contactar Suporte",
      };
    case DeliveryStatus.PENDING:
      return {
        subjectSuffix: `Processando Entrega #${data.deliveryNumber}`,
        emailTitle: "Processando a Sua Entrega",
        title: "Processando Entrega",
        line1: `A sua entrega ${orderRefText} está a ser processada pelo nosso sistema.`,
        line2: "Receberá atualizações em breve.",
        isNeutral: true, primaryButtonText: "Ver Estado",
      };
    default:
      return { subjectSuffix: `Atualização da Entrega #${data.deliveryNumber}`, emailTitle: "Atualização da Sua Entrega", title: "Atualização de Entrega", line1: `O estado da sua entrega ${orderRefText} foi atualizado para: ${status}.`, isNeutral: true, primaryButtonText: "Ver Detalhes" };
  }
};