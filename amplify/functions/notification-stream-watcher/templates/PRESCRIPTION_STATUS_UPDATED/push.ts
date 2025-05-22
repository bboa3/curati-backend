import { NotificationChannel, NotificationPayload, PrescriptionStatus, Priority } from "../../../helpers/types/schema";
import { convertPrescriptionStatus } from "../../helpers/enum/prescriptionStatus";
import { PushMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
  priority: Priority;
}

export const generatePushMessage = ({ templateData, channel, payload, priority }: TemplateInput): PushMessage => {
  const { prescriptionNumber, prescriptionStatus, statusReason } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })


  const friendlyStatusText = convertPrescriptionStatus(prescriptionStatus);
  const title = `${brandConfig.appName}: Receita #${prescriptionNumber} ${prescriptionStatus === PrescriptionStatus.ACTIVE ? 'Aprovada' : 'Atualizada'}`;

  let body = `Sua receita #${prescriptionNumber} ${friendlyStatusText}.`;
  if (prescriptionStatus !== PrescriptionStatus.ACTIVE && statusReason) {
    body += ` Motivo: ${statusReason.substring(0, 50)}${statusReason.length > 50 ? '...' : ''}`;
  }
  body += ` Toque para ver.`;

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};