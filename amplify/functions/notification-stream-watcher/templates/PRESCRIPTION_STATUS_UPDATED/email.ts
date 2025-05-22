import { NotificationChannel, NotificationPayload, PrescriptionStatus } from "../../../helpers/types/schema";
import { convertPrescriptionStatus } from '../../helpers/enum/prescriptionStatus';
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

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const { recipientName, prescriptionNumber, prescriptionStatus, statusReason } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const isApproved = prescriptionStatus === PrescriptionStatus.ACTIVE;
  const friendlyStatus = convertPrescriptionStatus(prescriptionStatus);

  const subject = isApproved
    ? `${brandConfig.appName}: Receita #${prescriptionNumber} Aprovada!`
    : `${brandConfig.appName}: Atualização da Receita #${prescriptionNumber}`;
  const preheaderText = isApproved
    ? `Boas notícias! A sua receita #${prescriptionNumber} foi validada.`
    : `Informação sobre a sua receita #${prescriptionNumber}: ${friendlyStatus}.`;

  let html = generateEmailHeader({ brandConfig, preheaderText });

  if (isApproved) {
    html += `
      <h2 style="margin:0 0 16px;color:${brandConfig.colors.GREEN};">
        Receita Aprovada!
      </h2>
      <p style="margin:0 0 10px;">Prezado(a) ${recipientName},</p>
      <p style="margin:0 0 20px;">
        A sua receita (Nº <strong>${prescriptionNumber}</strong>) foi validada e está ativa.
      </p>
      <p style="font-weight:bold;margin:0 0 5px;">Próximo passo:</p>
      <p style="margin:0 0 15px;">
        Já pode encomendar seus medicamentos na aplicação.
      </p>
      ${generateEmailButton({
      text: 'Ver Receita e Encomendar',
      url: deepLink,
      brandConfig,
    })}
    `;
  } else {
    html += `
      <h2 style="margin:0 0 16px;color:${brandConfig.colors.ORANGE};">
        Atualização da Receita
      </h2>
      <p style="margin:0 0 10px;">Prezado(a) ${recipientName},</p>
      <p style="margin:0 0 10px;">
        O estado da sua receita (Nº <strong>${prescriptionNumber}</strong>) é <strong>${friendlyStatus}</strong>.
      </p>
      ${statusReason ? `<div style="border-left:5px solid ${brandConfig.colors.ORANGE};background:${brandConfig.colors.YELLOW3};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${brandConfig.colors.BLACK};">
        ${statusReason}
      </div>` : ''}
      <p style="font-weight:bold;margin:0 0 5px;">O que fazer:</p>
      <p style="margin:0 0 15px;">
        ${statusReason?.toLowerCase().includes('médico')
        ? 'Contacte o seu médico para os próximos passos.'
        : 'Verifique na app ou contacte o suporte para assistência.'
      }
      </p>
      ${generateEmailButton({
        text: 'Ver Detalhes da Receita',
        url: deepLink,
        brandConfig,
        customBackgroundColor: brandConfig.colors.BLACK3,
        customTextColor: brandConfig.colors.BLACK,
      })}
      <p style="font-size:13px;margin:15px 0 0;">
        Suporte: <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">${brandConfig.supportEmail}</a>
      </p>
    `;
  }

  html += `
    <div style="height:20px;"></div>
    <p style="margin:0;padding-top:20px;">
      Atenciosamente,<br/>Equipa ${brandConfig.appName}
    </p>
  `;
  html += generateEmailFooter({ brandConfig });

  let textBody = '';
  if (isApproved) {
    textBody = `
${subject}

Prezado(a) ${recipientName},

A sua receita #${prescriptionNumber} foi validada com sucesso e está ativa.

Ver Receita e Encomendar:
${deepLink}

Atenciosamente,
Equipa ${brandConfig.appName}
`.trim();
  } else {
    textBody = `
${subject}

Prezado(a) ${recipientName},

O estado da sua receita #${prescriptionNumber} é ${friendlyStatus}.
${statusReason ? `Detalhes: ${statusReason}\n` : ''}

Ver Detalhes da Receita:
${deepLink}

Suporte: ${brandConfig.supportEmail}

Atenciosamente,
Equipa ${brandConfig.appName}
`.trim();
  }
  textBody += `\n\n© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.`;

  return { emailAddresses: channel.targets, subject, htmlBody: html, textBody };
};