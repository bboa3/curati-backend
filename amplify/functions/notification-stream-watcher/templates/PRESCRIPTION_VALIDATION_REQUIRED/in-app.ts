import { NotificationChannel } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const {
    prescriptionNumber,
    patientName,
  } = templateData;

  const title = "Receita Aguarda Validação";
  let shortMessage = `Validar Receita #${prescriptionNumber}`;
  if (patientName) shortMessage += ` (Pac: ${patientName.split(' ')[0]})`;

  let fullMessage = `Receita #${prescriptionNumber}`;
  if (patientName) fullMessage += ` para o paciente ${patientName}`;
  fullMessage += `, necessita da sua validação.`;

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};