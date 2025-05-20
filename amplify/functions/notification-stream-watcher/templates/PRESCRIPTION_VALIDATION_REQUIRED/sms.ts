import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData }: TemplateInput): SmsMessage => {
  const { prescriptionNumber, patientName } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const header = generateSmsHeaderPrefix({ brandConfig });
  let body = `${header}Validação Pendente: Receita #${prescriptionNumber}`;
  if (patientName) {
    body += ` (Pac: ${patientName.split(' ')[0]})`;
  }
  body += `. Aceda à plataforma para validar.`;

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};