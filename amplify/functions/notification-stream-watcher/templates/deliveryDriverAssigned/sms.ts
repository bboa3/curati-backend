import { NotificationChannel, NotificationPayload, UserRole } from "../../../helpers/types/schema";
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
  const {
    recipientType,
    deliveryNumber,
    driverName,
    pharmacyName,
  } = templateData;
  const isPatient = recipientType === UserRole.PATIENT;
  const appNameToUse = isPatient ? "Cúrati" : "Cúrati Go";
  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse });
  const header = generateSmsHeaderPrefix({ brandConfig });
  const deepLink = payload.href || brandConfig.universalLink;

  let body = "";
  if (isPatient) {
    body = `${header}Entrega #${deliveryNumber}: Motorista ${driverName ? driverName.split(' ')[0] : ''} a caminho da farmácia. Acompanhe: ${deepLink}`;
  } else {
    body = `${header}Entrega #${deliveryNumber} é SUA! Recolha em ${pharmacyName ? pharmacyName.substring(0, 15) : 'farmácia'}. Detalhes/Rota: ${deepLink}`;
  }

  return {
    phoneNumbers: channel.targets,
    body: body,
  }
};