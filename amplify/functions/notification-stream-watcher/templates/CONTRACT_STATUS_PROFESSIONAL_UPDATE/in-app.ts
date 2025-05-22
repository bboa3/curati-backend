import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';
import { getContractStatusProfessionalTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const textParts = getContractStatusProfessionalTextParts(templateData, "Cúrati RX");
  const title = `${textParts.title} - Contrato #${templateData.contractNumber}`;

  const shortMessage = `${textParts.line1.split('.')[0].replace(/<strong>|<\/strong>/g, '')} (Serviço: ${templateData.serviceName}, Paciente: ${templateData.patientName}).`;
  let fullMessage = `${textParts.line1.replace(/<strong>|<\/strong>/g, '')}\n\n${textParts.line2Context?.replace(/<strong>|<\/strong>/g, '') || ''}`;
  if (textParts.line3ActionOrInfo) fullMessage += `\n\n${textParts.line3ActionOrInfo.replace(/<strong>|<\/strong>/g, '')}`;

  return {
    title,
    message: fullMessage,
    shortMessage: shortMessage,
  };
};