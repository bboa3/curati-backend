import { NotificationChannel, NotificationPayload, Priority, UserRole } from "../../../helpers/types/schema";
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
  const {
    recipientType,
    deliveryNumber,
    driverName,
    pharmacyName,
  } = templateData;

  const isPatient = recipientType === UserRole.PATIENT;
  const appNameToUse = isPatient ? "Cúrati" : "Cúrati Go";
  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse });

  let title = "";
  let body = "";

  if (isPatient) {
    title = `${brandConfig.appName}: Motorista Designado!`;
    body = `Entrega #${deliveryNumber}: ${driverName ? driverName.split(' ')[0] : 'Seu motorista'} está a caminho da farmácia. Toque para acompanhar.`;
  } else { // For DRIVER
    title = `${brandConfig.appName}: Entrega #${deliveryNumber} É Sua!`;
    body = `Recolha em ${pharmacyName ? pharmacyName.substring(0, 20) : 'farmácia'}. Toque para ver detalhes e iniciar rota.`;
  }

  return {
    title: title,
    body: body,
    pushTokens: channel.targets,
    priority: priority,
    payload: payload,
  }
};