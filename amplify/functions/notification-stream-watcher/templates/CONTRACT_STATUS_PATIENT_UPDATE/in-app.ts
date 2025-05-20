import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';
import { getContractStatusPatientTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const textParts = getContractStatusPatientTextParts(templateData, "Cúrati");
  const title = `${textParts.title} - Contrato #${templateData.contractNumber}`;
  const shortMessage = `${textParts.line1.split('.')[0].replace(/<strong>|<\/strong>/g, '')}.`;
  const fullMessage = `${textParts.line1.replace(/<strong>|<\/strong>/g, '')}\n${textParts.line2?.replace(/<strong>|<\/strong>/g, '') || ''}\n${textParts.line3?.replace(/<strong>|<\/strong>/g, '') || ''}`;


  return {
    title,
    message: fullMessage,
    shortMessage: shortMessage,
  };
};