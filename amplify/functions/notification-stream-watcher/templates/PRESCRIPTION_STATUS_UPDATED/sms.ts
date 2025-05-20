import { NotificationChannel, NotificationPayload, PrescriptionStatus } from "../../../helpers/types/schema";
import { convertPrescriptionStatus } from "../../helpers/enum/prescriptionStatus";
import { SmsMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateSmsHeaderPrefix } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateSmsMessage = ({ channel, templateData, payload }: TemplateInput): SmsMessage => {
  const { prescriptionNumber, prescriptionStatus, statusReason } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })

  const header = generateSmsHeaderPrefix({ brandConfig });
  const shortStatus = convertPrescriptionStatus(prescriptionStatus as PrescriptionStatus);
  const prescriptionDeepLink = payload.href || brandConfig.universalLink;

  let body = `${header}Receita #${prescriptionNumber} ${shortStatus}. `;
  if (prescriptionStatus === PrescriptionStatus.ACTIVE) {
    body += `Pode encomendar seus meds agora. Detalhes: ${prescriptionDeepLink}`;
  } else {
    body += `${statusReason ? `${statusReason.substring(0, 30)}... ` : ''}Verifique app ou contacte suporte. Detalhes: ${prescriptionDeepLink}`;
  }

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};