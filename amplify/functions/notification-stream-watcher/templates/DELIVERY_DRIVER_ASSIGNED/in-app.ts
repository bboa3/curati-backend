import { NotificationChannel, UserRole } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const {
    recipientType,
    deliveryNumber,
    driverName,
    pharmacyName,
    pharmacyAddressSnippet,
  } = templateData;
  const isPatient = recipientType === UserRole.PATIENT;

  let title = "";
  let shortMessage = "";
  let fullMessage = "";

  if (isPatient) {
    title = "Motorista Designado";
    shortMessage = `Entrega #${deliveryNumber}: ${driverName ? driverName.split(' ')[0] : 'Motorista'} a caminho.`;
    fullMessage = `Boas notícias! ${driverName ? `O motorista ${driverName}` : 'Um motorista'} foi designado para a sua entrega #${deliveryNumber} e está a caminho da farmácia para recolha. Toque para acompanhar em tempo real.`;
  } else { // For DRIVER
    title = `Entrega #${deliveryNumber} Atribuída`;
    shortMessage = `Nova entrega! Recolha em ${pharmacyName ? pharmacyName : 'farmácia'}.`;
    fullMessage = `Parabéns! A entrega #${deliveryNumber} é sua. Detalhes da recolha: ${pharmacyName} (${pharmacyAddressSnippet}). Por favor, prepare-se e use a app para iniciar a rota.`;
  }

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};