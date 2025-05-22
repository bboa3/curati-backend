import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';
import { getDriverDeliveryStatusTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const statusParts = getDriverDeliveryStatusTextParts(templateData);
  const title = statusParts.title;
  const shortMessage = `Entrega #${templateData.deliveryNumber}: ${statusParts.line1.split('.')[0]}.`;

  let fullMessage = statusParts.line1;
  if (statusParts.line2) {
    fullMessage += ` ${statusParts.line2}`;
  }
  if (statusParts.line3) {
    fullMessage += `\n\n${statusParts.line3}`;
  }
  return {
    title,
    message: fullMessage,
    shortMessage,
  };
};