import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';
import { getAdminDeliveryAlertTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const statusParts = getAdminDeliveryAlertTextParts(templateData);
  const title = `${statusParts.title} (#${templateData.deliveryNumber})`;
  const shortMessage = `${statusParts.line1.split('.')[0]}. ${statusParts.line2 ? statusParts.line2.split('.')[0] + '.' : ''}`;
  let fullMessage = `${statusParts.line1}${statusParts.line2 ? ` ${statusParts.line2}` : ''}${statusParts.line3 ? `\n\nDetalhes Adicionais: ${statusParts.line3}` : ''}`;

  return {
    title,
    message: fullMessage,
    shortMessage,
  };
};