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
  const { recipientName, recipientType, deliveryNumber, driverName, deliveryWindowStartTime, deliveryWindowEndTime, pharmacyName, pharmacyAddressSnippet } = templateData;
  const isPatient = recipientType === UserRole.PATIENT;
  const brandConfig = getDefaultBrandConfig({ appName: isPatient ? 'Cúrati' : 'Cúrati Go' });
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const formattedDeliveryWindow = `${formatTimeWithHourSuffix(deliveryWindowStartTime)} - ${formatTimeWithHourSuffix(deliveryWindowEndTime)}`;
  const preheader = isPatient
    ? `Boas notícias! ${driverName || 'Um motorista'} está a caminho com a sua encomenda Cúrati.`
    : `Entrega #${deliveryNumber} atribuída! Pronto para recolher em ${pharmacyName}.`;
  const subject = isPatient
    ? `${brandConfig.appName}: Motorista a caminho para sua entrega #${deliveryNumber}!`
    : `${brandConfig.appName}: Entrega #${deliveryNumber} É Sua!`;

  let html = generateEmailHeader({ brandConfig, preheaderText: preheader });

  if (isPatient) {
    html += `
      <h2 style="margin:0 0 16px;color:${brandConfig.colors.PRIMARY};">Motorista Designado!</h2>
      <p style="margin:0 0 10px;">Prezado(a) ${recipientName},</p>
      <p style="margin:0 0 15px;">Boas notícias! ${driverName ? `O nosso motorista, ${driverName}, foi designado` : 'Um motorista foi designado'} para a sua entrega (Ref: <strong>#${deliveryNumber}</strong>) e está a caminho da farmácia.</p>
      <p style="font-size:16px;font-weight:bold;margin:0 0 5px;">Janela de Entrega Prevista:</p>
      <p style="font-size:16px;color:${brandConfig.colors.PRIMARY};margin:0 0 20px;">${formattedDeliveryWindow}</p>
      <div style="border-left:5px solid ${brandConfig.colors.PRIMARY};background:${brandConfig.colors.PRIMARY4};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${brandConfig.colors.PRIMARY};">
        <p style="margin:0 0 5px;font-weight:bold;">Acompanhe em Tempo Real:</p>
        <p style="margin:0;">Pode seguir a localização do motorista e o progresso da sua entrega na aplicação.</p>
      </div>
      ${generateEmailButton({ text: 'Acompanhar a Minha Entrega', url: deepLink, brandConfig })}
      <div style="height:15px;"></div>
      <p style="font-size:13px;margin:0;">Recomendamos que esteja atento(a) às notificações.</p>
    `;
  } else {
    html += `
      <h2 style="margin:0 0 16px;color:${brandConfig.colors.GREEN};">Entrega #${deliveryNumber} É Sua!</h2>
      <p style="margin:0 0 10px;">Parabéns ${recipientName}!</p>
      <p style="margin:0 0 15px;">Esta entrega foi atribuída a si. Prepare-se para iniciar a rota.</p>
      <p style="font-size:16px;font-weight:bold;margin:0 0 5px;">Detalhes da Recolha:</p>
      <p style="margin:0 0 5px;">• <strong>Farmácia:</strong> ${pharmacyName}</p>
      <p style="margin:0 0 15px;">• <strong>Local:</strong> ${pharmacyAddressSnippet}</p>
      <p style="font-size:16px;font-weight:bold;margin:0 0 5px;">Janela de Entrega (Paciente):</p>
      <p style="margin:0 0 20px;color:${brandConfig.colors.BLACK2};">${formattedDeliveryWindow}</p>
      <div style="border-left:5px solid ${brandConfig.colors.GREEN};background:${brandConfig.colors.GREEN3};padding:10px 15px;border-radius:4px;margin:0 0 15px;color:${brandConfig.colors.BLACK};">
        <p style="margin:0 0 5px;font-weight:bold;color:${brandConfig.colors.GREEN};">Ação Imediata:</p>
        <p style="margin:0;">Dirija-se ao local de recolha e utilize a app Cúrati Go para ver a rota completa e iniciar a viagem.</p>
      </div>
      ${generateEmailButton({ text: 'Ver Detalhes e Iniciar Rota', url: deepLink, brandConfig, customBackgroundColor: brandConfig.colors.PRIMARY })}
      <div style="height:15px;"></div>
      <p style="font-size:13px;margin:0;">Obrigado pela sua prontidão! Viagem segura.</p>
    `;
  }

  html += `
    <p style="margin:25px 0 0;">Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>
  `;
  html += generateEmailFooter({ brandConfig });

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
    htmlBody: html,
    textBody,
  };
};