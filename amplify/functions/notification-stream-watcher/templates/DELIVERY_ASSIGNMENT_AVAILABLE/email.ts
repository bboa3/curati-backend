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

export const generateEmailMessage = ({ templateData, channel, payload }: TemplateInput): EmailMessage => {
  const { recipientName, deliveryNumber, offerExpiryInfo } = templateData;
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati Go' });
  const subject = `${brandConfig.appName}: Nova Oportunidade de Entrega! (#${deliveryNumber})`;
  const deepLink = payload.href || brandConfig.universalLink;
  const preheaderText = `Nova entrega #${deliveryNumber} disponível! Aja rápido para aceitar.`;
  let html = generateEmailHeader({ brandConfig, preheaderText });

  html += `
    <h2 style="margin:0 0 16px;color:${brandConfig.colors.PRIMARY};">
      Nova Oportunidade de Entrega Cúrati Go!
    </h2>
    <p style="margin:0 0 10px;">Prezado(a) ${recipientName},</p>
    <p style="margin:0 0 10px;">
      Temos uma nova oportunidade de entrega (Ref: <strong>#${deliveryNumber}</strong>) disponível na sua área e gostaríamos de lhe oferecer!
    </p>
    <p style="font-size:13px;color:${brandConfig.colors.BLACK2};margin:0 0 20px;">
      Esta oferta pode ter sido enviada a um número limitado de motoristas disponíveis.
    </p>
    <div style="border-left:5px solid ${brandConfig.colors.YELLOW};background:${brandConfig.colors.YELLOW3};padding:10px 15px;border-radius:4px;margin:0 0 10px;color:${brandConfig.colors.BLACK};">
      <p style="margin:0 0 5px;font-weight:bold;color:${brandConfig.colors.BLACK};">Aja Rápido!</p>
      <p style="margin:0;color:${brandConfig.colors.BLACK2};">
        Para garantir esta entrega, seja um dos primeiros a aceitar. ${offerExpiryInfo || 'Esta oportunidade está disponível por tempo limitado.'}
      </p>
    </div>
    <p style="margin:0 0 10px;">Reveja rapidamente os detalhes e clique abaixo para aceitar se estiver disponível:</p>
    ${generateEmailButton({
    text: 'Ver e Aceitar Oportunidade na App',
    url: deepLink,
    brandConfig,
  })}
    <div style="height:20px;"></div>
    <p style="font-size:13px;margin:0;">
      Se não puder aceitar, não precisa fazer nada. A oferta expirará ou será atribuída a outro motorista.
    </p>
    <p style="margin:20px 0 0;">Agradecemos a sua disponibilidade!<br/>Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig, showSupportEmail: true });

  const textBody = `
${subject}

Prezado(a) ${recipientName},

Temos uma nova oportunidade de entrega (Ref: #${deliveryNumber}) disponível na sua área!
Esta oferta pode ter sido enviada a um número limitado de motoristas.

-- Aja Rápido! --
Para garantir esta entrega, seja um dos primeiros a aceitar.
${offerExpiryInfo || 'Disponível por tempo limitado.'}
------------------

Reveja os detalhes e aceite na app:
${deepLink}

Se não puder aceitar, não precisa fazer nada.

Agradecemos a sua disponibilidade!
Equipa ${brandConfig.appName}

© ${brandConfig.copyrightYearStart}-${new Date().getFullYear()} ${brandConfig.appNameLegal}.
`.trim();

  return { emailAddresses: channel.targets, subject, htmlBody: html, textBody };
};