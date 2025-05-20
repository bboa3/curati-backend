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
  const {
    recipientName,
    prescriptionNumber,
    prescriptionStatus,
    statusReason,
  } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const isApproved = prescriptionStatus === PrescriptionStatus.ACTIVE;
  const friendlyStatus = convertPrescriptionStatus(prescriptionStatus);
  const currentYear = new Date().getFullYear();
  const deepLink = payload.href || brandConfig.universalLink;

  const subject = isApproved
    ? `${brandConfig.appName}: Receita #${prescriptionNumber} Aprovada!`
    : `${brandConfig.appName}: Atualização da Receita #${prescriptionNumber}`;
  const preheaderText = isApproved
    ? `Boas notícias! A sua receita #${prescriptionNumber} foi validada.`
    : `Informação importante sobre a sua receita #${prescriptionNumber}. Estado: ${friendlyStatus}.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  if (isApproved) {
    mjmlBody += `
      <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.GREEN}" padding-bottom="15px">
        Receita Aprovada!
      </mj-text>
      <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
      <mj-text padding-bottom="20px">
        Temos boas notícias! A sua receita médica (Nº <strong>${prescriptionNumber}</strong>) foi validada com sucesso e está ativa.
      </mj-text>
      <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">
        Próximo Passo:
      </mj-text>
      <mj-text padding-bottom="15px">
        Já pode adicionar os medicamentos à sua encomenda através da aplicação Cúrati.
      </mj-text>
      ${generateEmailButton({
      text: "Ver Receita e Encomendar",
      url: deepLink,
      brandConfig,
      customBackgroundColor: brandConfig.colors.PRIMARY,
    })}
    `;
  } else {
    mjmlBody += `
      <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.ORANGE}" padding-bottom="15px">
        Atualização da Sua Receita
      </mj-text>
      <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
      <mj-text padding-bottom="10px">
        Informamos sobre o estado da sua receita médica (Nº <strong>${prescriptionNumber}</strong>): <strong>${friendlyStatus}</strong>.
      </mj-text>
      ${statusReason ? `<mj-raw><div class="highlight-box" style="border-left-color: ${brandConfig.colors.ORANGE}; margin-top:0; margin-bottom:15px;"><mj-text color="${brandConfig.colors.ORANGE2}">${statusReason}</mj-text></div></mj-raw>` : ''}
      <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">
        O que fazer:
      </mj-text>
      <mj-text padding-bottom="10px">
        ${statusReason && statusReason.toLowerCase().includes('médico') ? 'Recomendamos que entre em contacto com o seu médico prescritor para discutir os próximos passos.' : 'Por favor, verifique os detalhes na aplicação ou contacte o nosso suporte para mais informações e assistência.'}
      </mj-text>
      ${generateEmailButton({
      text: "Ver Detalhes da Receita",
      url: deepLink,
      brandConfig,
      customBackgroundColor: brandConfig.colors.BLACK3,
      customTextColor: brandConfig.colors.BLACK,
    })}
      <mj-text font-size="13px" padding-top="15px">
        Pode contactar o suporte através de <a href="mailto:${brandConfig.supportEmail}" style="color:${brandConfig.colors.PRIMARY};">${brandConfig.supportEmail}</a>.
      </mj-text>
    `;
  }

  mjmlBody += `
    <mj-spacer height="20px" />
    <mj-text padding-top="20px">Atenciosamente,<br />Equipa ${brandConfig.appName}</mj-text>
  `;
  mjmlBody += generateEmailFooter({ brandConfig });

  let textBody = "";
  if (isApproved) {
    textBody = `
${brandConfig.appName}: Receita #${prescriptionNumber} Aprovada!

Prezado(a) ${recipientName},

Temos boas notícias! A sua receita médica (Nº ${prescriptionNumber}) foi validada com sucesso e está ativa.

Próximo Passo: Já pode adicionar os medicamentos à sua encomenda através da aplicação Cúrati.

Ver Receita e Encomendar:
${deepLink}

Atenciosamente,
Equipa ${brandConfig.appName}
    `.trim();
  } else {
    textBody = `
${brandConfig.appName}: Atualização da Receita #${prescriptionNumber}

Prezado(a) ${recipientName},

Informamos sobre o estado da sua receita médica (Nº ${prescriptionNumber}): ${friendlyStatus}.
${statusReason ? `\nDetalhes: ${statusReason}\n` : ''}
O que fazer:
${statusReason && statusReason.toLowerCase().includes('médico') ? 'Recomendamos que entre em contacto com o seu médico prescritor para discutir os próximos passos.' : 'Por favor, verifique os detalhes na aplicação ou contacte o nosso suporte para mais informações e assistência.'}

Ver Detalhes da Receita:
${deepLink}

Suporte: ${brandConfig.supportEmail}

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