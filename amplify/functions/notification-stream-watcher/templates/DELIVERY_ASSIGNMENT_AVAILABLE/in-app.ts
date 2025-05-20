import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const {
    deliveryNumber,
    offerExpiryInfo,
  } = templateData;

  const title = "Nova Oportunidade de Entrega";

  let shortMessage = `Entrega #${deliveryNumber} disponível.`;
  if (offerExpiryInfo) {
    shortMessage += ` ${offerExpiryInfo}`;
  } else {
    shortMessage += ` Aja rápido!`;
  }

  let fullMessage = `Uma nova oportunidade de entrega (Ref: #${deliveryNumber}) está disponível para si.`;
  if (offerExpiryInfo) {
    fullMessage += `\n\n<strong>Atenção:</strong> ${offerExpiryInfo}`;
  } else {
    fullMessage += `\n\n<strong>Atenção:</strong> Esta oferta está disponível por tempo limitado e para os primeiros a aceitar.`;
  }
  fullMessage += `\n\nToque para ver os detalhes e aceitar.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};