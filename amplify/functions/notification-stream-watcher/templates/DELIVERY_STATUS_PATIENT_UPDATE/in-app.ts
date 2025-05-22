import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';
import { getPatientDeliveryStatusTextParts } from "./status-text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const statusParts = getPatientDeliveryStatusTextParts(templateData);
  return {
    title: statusParts.title,
    message: `${statusParts.line1}${statusParts.line2 ? ` ${statusParts.line2}` : ''}`,
    shortMessage: `${statusParts.title}: ${statusParts.line1.split('.')[0]}.`,
  };
};