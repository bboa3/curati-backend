import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel }: TemplateInput): EmailMessage => {
  const { prescriptionNumber, patientName, recipientName } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const currentYear = new Date().getFullYear();
  const preheaderText = `Receita #${prescriptionNumber} aguarda validação.`;

  let html = generateEmailHeader({ brandConfig, preheaderText });
  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.ORANGE};">
      Validação de Receita Pendente
    </h2>
    <p style="margin:0 0 10px;">
      Prezado(a) ${recipientName},
    </p>
    <p style="margin:0 0 20px;">
      A receita #${prescriptionNumber} de ${patientName} aguarda validação na plataforma.
    </p>
    <div style="border-left:5px solid ${brandConfig.colors.ORANGE};background:${brandConfig.colors.YELLOW3};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${brandConfig.colors.ORANGE};">
      Por favor, valide esta prescrição o mais breve possível.
    </div>
    ${generateEmailButton({
    text: 'Validar Receita',
    url: brandConfig.universalLink,
    brandConfig,
  })}
    <div style="height:20px;"></div>
    <p style="margin:0;padding-top:20px;">
      Obrigado pela sua dedicação,<br/>Sistema ${brandConfig.appName}
    </p>
  `;
  html += generateEmailFooter({ brandConfig, showSupportEmail: false });

  const textBody = `
${brandConfig.appName} Admin: Validação de Receita Pendente - #${prescriptionNumber}

Prezada Equipa,

A receita #${prescriptionNumber} de ${patientName} aguarda validação na plataforma.

Validar agora: ${brandConfig.universalLink}

Obrigado,
Sistema ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.
  `.trim();

  return { emailAddresses: channel.targets, subject: `${brandConfig.appName} Admin: Validação de Receita #${prescriptionNumber}`, htmlBody: html, textBody };
};

