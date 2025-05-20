import { NotificationChannel, UserRole } from "../../../helpers/types/schema";
import { InAppMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { TemplateData } from './schema';
import { getMedicineOrderCreatedTextParts } from "./text-helper";

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const { recipientRole } = templateData;
  const isPharmacist = recipientRole === UserRole.PROFESSIONAL;
  const appNameToUse = isPharmacist ? "Cúrati RX" : "Cúrati Admin";

  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const textParts = getMedicineOrderCreatedTextParts(templateData, brandConfig.appName);
  const title = textParts.title;
  const shortMessage = textParts.line1.replace(/<strong>|<\/strong>/g, '').substring(0, 100);

  let fullMessage = textParts.line1.replace(/<strong>|<\/strong>/g, '');
  if (textParts.line2) fullMessage += `\n${textParts.line2.replace(/<strong>|<\/strong>/g, '')}`;
  if (textParts.line3) fullMessage += `\n${textParts.line3.replace(/<strong>|<\/strong>/g, '')}`;
  fullMessage += `\n${textParts.callToAction}`;

  return {
    title,
    message: fullMessage,
    shortMessage,
  };
};