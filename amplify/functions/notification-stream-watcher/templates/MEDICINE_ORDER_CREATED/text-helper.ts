import { formatDateTimeNumeric } from "../../../helpers/date/formatter";
import { DeliveryType, UserRole } from "../../../helpers/types/schema";
import { TemplateData } from "./schema";

const formatDeliveryType = (deliveryType?: DeliveryType): string => {
  if (!deliveryType) return '';
  switch (deliveryType) {
    case DeliveryType.DELIVERY: return "para Entrega ao Domicílio";
    case DeliveryType.PICKUP: return "para Retirada na Farmácia";
    default: return "";
  }
}

export interface OrderCreatedTextParts {
  subject: string;
  emailTitle: string;
  title: string;
  greeting: string;
  line1: string;
  line2?: string;
  line3?: string;
  callToAction: string;
  buttonText: string;
  isPositive?: boolean;
  isInfo?: boolean;
}

export const getMedicineOrderCreatedTextParts = (data: TemplateData, appName: string): OrderCreatedTextParts => {
  const role = data.recipientRole;
  const formattedOrderDateTime = formatDateTimeNumeric(data.orderDate);

  if (role === UserRole.PROFESSIONAL) {
    return {
      subject: `${appName} - Farmácia: Novo Pedido #${data.orderNumber} Recebido!`,
      emailTitle: "Novo Pedido de Medicamentos Recebido!",
      title: "Novo Pedido Recebido",
      greeting: `Prezada Equipa ${data.pharmacyName || 'da Farmácia'},`,
      line1: `Um novo pedido de medicamentos (Nº <strong>${data.orderNumber}</strong>) foi submetido para a vossa farmácia e aguarda processamento.`,
      line2: `Paciente: ${data.patientName}. Data do Pedido: ${formattedOrderDateTime}.`,
      line3: `${data.itemCount ? `${data.itemCount} ite${data.itemCount > 1 ? 'ns' : 'm'}. ` : ''}${data.itemsSnippet ? `Itens: ${data.itemsSnippet.substring(0, 70)}${data.itemsSnippet.length > 70 ? '...' : ''}. ` : ''}${data.deliveryType ? `Tipo: ${formatDeliveryType(data.deliveryType as DeliveryType)}.` : ''}`,
      callToAction: "Por favor, acedam ao vosso portal para rever e processar este pedido o mais breve possível.",
      buttonText: "Processar Pedido Agora",
      isPositive: true,
    };
  }

  return {
    subject: `Admin Cúrati: Novo Pedido de Medicamentos #${data.orderNumber} Criado`,
    emailTitle: "Novo Pedido de Medicamentos Registado",
    title: "Novo Pedido Criado",
    greeting: "Estimada Equipa Admin Cúrati,",
    line1: `Um novo pedido de medicamentos (Nº <strong>${data.orderNumber}</strong>) foi criado no sistema.`,
    line2: `Paciente: ${data.patientName}. Data: ${formattedOrderDateTime}. ${data.pharmacyName ? `Farmácia: ${data.pharmacyName}.` : ''}`,
    line3: data.orderValue ? `Valor do Pedido: ${data.orderValue}.` : (data.itemCount ? `${data.itemCount} iten(s).` : "Para sua informação."),
    callToAction: "Podem acompanhar o pedido através do painel de administração.",
    buttonText: "Ver Detalhes do Pedido",
    isInfo: true,
  };
};