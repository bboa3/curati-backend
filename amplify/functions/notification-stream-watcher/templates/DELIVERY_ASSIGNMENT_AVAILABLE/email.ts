import mjml2html from 'mjml';
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
  const {
    recipientName,
    deliveryNumber,
    offerExpiryInfo,
  } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati Go" })
  const subject = `${brandConfig.appName}: Nova Oportunidade de Entrega! (#${deliveryNumber})`;
  const currentYear = new Date().getFullYear();

  const deepLink = payload.href || brandConfig.universalLink;
  const preheaderText = `Nova entrega #${deliveryNumber} disponível! Aja rápido para aceitar.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
  <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="15px">
    Nova Oportunidade de Entrega Cúrati Go!
  </mj-text>
  <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
  <mj-text padding-bottom="10px">
    Temos uma nova oportunidade de entrega (Ref: <strong>#${deliveryNumber}</strong>) disponível na sua área e gostaríamos de lhe oferecer!
  </mj-text>
  <mj-text css-class="small-text" font-size="13px" color="${brandConfig.colors.BLACK2}" padding-bottom="20px">
    Esta oferta pode ter sido enviada a um número limitado de motoristas disponíveis.
  </mj-text>

  <mj-raw><div class="highlight-box" style="border-left-color: ${brandConfig.colors.YELLOW}; background-color: ${brandConfig.colors.YELLOW3}; color: ${brandConfig.colors.BLACK};"> </mj-raw>
    <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">Aja Rápido!</mj-text>
    <mj-text color="${brandConfig.colors.BLACK2}">
      Para garantir esta entrega, você deve ser um dos primeiros motoristas a aceitar.
      ${offerExpiryInfo ? offerExpiryInfo : "Esta oportunidade está disponível por tempo limitado."}
    </mj-text>
  <mj-raw></div></mj-raw>
  <mj-spacer height="10px" />
  
  <mj-text padding-bottom="10px">Reveja rapidamente os detalhes e clique abaixo para aceitar se estiver disponível:</mj-text>
  ${generateEmailButton({
    text: "Ver e Aceitar Oportunidade na App",
    url: deepLink,
    brandConfig,
    customBackgroundColor: brandConfig.colors.PRIMARY,
  })}
  <mj-spacer height="20px" />

  <mj-text font-size="13px">
    Se não puder aceitar, não precisa fazer nada. A oferta expirará ou será atribuída a outro motorista.
  </mj-text>

  <mj-text padding-top="25px">Agradecemos a sua disponibilidade!<br />Equipa ${brandConfig.appName}</mj-text>
`;

  mjmlBody += generateEmailFooter({ brandConfig, showSupportEmail: true });

  const textBody = `
${brandConfig.appName}: Nova Oportunidade de Entrega! (#${deliveryNumber})

Prezado(a) ${recipientName},

Temos uma nova oportunidade de entrega (Ref: #${deliveryNumber}) disponível na sua área!
Esta oferta pode ter sido enviada a um número limitado de motoristas.

-- Aja Rápido! --
Para garantir esta entrega, seja um dos primeiros a aceitar.
${offerExpiryInfo ? offerExpiryInfo : "Disponível por tempo limitado."}
------------------

Reveja os detalhes e aceite na app:
${deepLink}

Se não puder aceitar, não precisa fazer nada.

Agradecemos a sua disponibilidade!
Equipa ${brandConfig.appName}

---
Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.
`.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: mjml2html(mjmlBody).html,
    textBody,
  };
};