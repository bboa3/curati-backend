import { formatTimeWithHourSuffix } from '../../../helpers/date/formatter';
import { NotificationChannel, NotificationPayload, UserRole } from "../../../helpers/types/schema";
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
    recipientType,
    deliveryNumber,
    driverName,
    deliveryWindowStartTime,
    deliveryWindowEndTime,
    pharmacyName,
    pharmacyAddressSnippet,
  } = templateData;
  const isPatient = recipientType === UserRole.PATIENT;
  const appNameToUse = isPatient ? "Cúrati" : "Cúrati Go";

  const brandConfig = getDefaultBrandConfig({ appName: appNameToUse })
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();

  const formattedDeliveryWindow = `${formatTimeWithHourSuffix(deliveryWindowStartTime)} - ${formatTimeWithHourSuffix(deliveryWindowEndTime)}`;

  let subject = "";
  let preheaderText = "";
  let mjmlBody = "";


  if (isPatient) {
    subject = `${brandConfig.appName}: Motorista a caminho para sua entrega #${deliveryNumber}!`;
    preheaderText = `Boas notícias! ${driverName || 'Um motorista'} está a caminho com a sua encomenda Cúrati.`;

    mjmlBody = generateEmailHeader({ brandConfig, preheaderText });
    mjmlBody += `
      <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="15px">
        Motorista Designado!
      </mj-text>
      <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
      <mj-text padding-bottom="15px">
        Boas notícias! ${driverName ? `O nosso motorista, ${driverName}, foi designado` : 'Um motorista foi designado'} para a sua entrega Cúrati (Ref: <strong>#${deliveryNumber}</strong>) e está a caminho da farmácia para recolher o seu pedido.
      </mj-text>
      <mj-text padding-bottom="5px" font-size="16px" font-weight="bold">Janela de Entrega Prevista:</mj-text>
      <mj-text padding-bottom="20px" font-size="16px" color="${brandConfig.colors.PRIMARY}">${formattedDeliveryWindow}</mj-text>
      
      <mj-raw><div class="highlight-box"></mj-raw>
        <mj-text font-weight="bold" color="${brandConfig.colors.PRIMARY}" padding-bottom="5px">Acompanhe em Tempo Real:</mj-text>
        <mj-text color="${brandConfig.colors.PRIMARY}">
          Pode seguir a localização do motorista e o progresso da sua entrega diretamente na aplicação.
        </mj-text>
      <mj-raw></div></mj-raw>

      ${generateEmailButton({
      text: "Acompanhar a Minha Entrega",
      url: deepLink,
      brandConfig,
    })}
      <mj-spacer height="15px" />
      <mj-text font-size="13px">Recomendamos que esteja atento(a) às notificações para atualizações.</mj-text>
    `;
  } else { // For DRIVER
    subject = `${brandConfig.appName}: Entrega #${deliveryNumber} Atribuída!`;
    preheaderText = `Parabéns! A entrega #${deliveryNumber} de ${pharmacyName} é sua. Prepare-se!`;

    mjmlBody = generateEmailHeader({ brandConfig, preheaderText });
    mjmlBody += `
      <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.GREEN}" padding-bottom="15px">
        Entrega #${deliveryNumber} É Sua!
      </mj-text>
      <mj-text padding-bottom="10px">Parabéns ${recipientName}!</mj-text>
      <mj-text padding-bottom="15px">
        Esta entrega foi atribuída a si. Por favor, prepare-se para iniciar a rota.
      </mj-text>
      <mj-text font-size="16px" font-weight="bold" padding-bottom="5px">Detalhes da Recolha:</mj-text>
      <mj-text padding-bottom="5px">• <strong>Farmácia:</strong> ${pharmacyName}</mj-text>
      <mj-text padding-bottom="15px">• <strong>Local:</strong> ${pharmacyAddressSnippet}</mj-text>
      <mj-text font-size="16px" font-weight="bold" padding-bottom="5px">Janela de Entrega (Paciente):</mj-text>
      <mj-text padding-bottom="20px" color="${brandConfig.colors.BLACK2}">${formattedDeliveryWindow}</mj-text>

      <mj-raw><div class="highlight-box" style="border-left-color: ${brandConfig.colors.GREEN}; background-color: ${brandConfig.colors.GREEN3}; color: ${brandConfig.colors.BLACK};"></mj-raw>
        <mj-text font-weight="bold" color="${brandConfig.colors.GREEN}" padding-bottom="5px">Ação Imediata:</mj-text>
        <mj-text color="${brandConfig.colors.BLACK}">
          Dirija-se ao local de recolha e utilize a app Cúrati Go para ver a rota completa e iniciar a viagem.
        </mj-text>
      <mj-raw></div></mj-raw>

      ${generateEmailButton({
      text: "Ver Detalhes e Iniciar Rota",
      url: deepLink,
      brandConfig,
      customBackgroundColor: brandConfig.colors.PRIMARY,
    })}
      <mj-spacer height="15px" />
      <mj-text font-size="13px">Obrigado pela sua prontidão! Faça uma viagem segura.</mj-text>
    `;
  }

  mjmlBody += `
    <mj-text padding-top="25px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
  `;
  mjmlBody += generateEmailFooter({ brandConfig });

  // Generate Plain Text Body
  let textBody = "";
  if (isPatient) {
    textBody = `
${brandConfig.appName}: Motorista a caminho para sua entrega #${deliveryNumber}!

Prezado(a) ${recipientName},
Boas notícias! ${driverName ? `O nosso motorista, ${driverName}, foi designado` : 'Um motorista foi designado'} para a sua entrega Cúrati (Ref: #${deliveryNumber}) e está a caminho da farmácia para recolher o seu pedido.

Janela de Entrega Prevista: ${formattedDeliveryWindow}

Acompanhe em Tempo Real na App:
${deepLink}

Recomendamos que esteja atento(a) às notificações.

Atenciosamente,
Equipa ${brandConfig.appName}
    `.trim();
  } else { // For DRIVER
    textBody = `
${brandConfig.appName}: Entrega #${deliveryNumber} Atribuída!

Parabéns ${recipientName}!
Esta entrega foi atribuída a si. Prepare-se para iniciar a rota.

Detalhes da Recolha:
- Farmácia: ${pharmacyName}
- Local: ${pharmacyAddressSnippet}

Janela de Entrega (Paciente): ${formattedDeliveryWindow}

AÇÃO IMEDIATA: Dirija-se ao local de recolha e use a app Cúrati Go para ver a rota e iniciar a viagem.

Ver Detalhes e Iniciar Rota:
${deepLink}

Obrigado pela sua prontidão! Viagem segura.

Atenciosamente,
Equipa ${brandConfig.appName}
    `.trim();
  }
  textBody += `
---
Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.
  `.trim();

  return {
    emailAddresses: channel.targets,
    subject,
    htmlBody: mjmlBody,
    textBody,
  };
};