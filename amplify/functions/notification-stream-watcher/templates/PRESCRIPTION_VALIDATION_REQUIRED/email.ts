import { NotificationChannel, NotificationPayload } from "../../../helpers/types/schema";
import { EmailMessage } from "../../helpers/types";
import { getDefaultBrandConfig } from "../shared/brand.config";
import { generateEmailFooter } from "../shared/footer";
import { generateEmailHeader } from "../shared/header";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData,
  payload: NotificationPayload,
}

export const generateEmailMessage = ({ templateData, channel }: TemplateInput): EmailMessage => {
  const {
    prescriptionNumber,
    patientName,
    recipientName
  } = templateData;

  const brandConfig = getDefaultBrandConfig({ appName: "Cúrati" })
  const subject = `${brandConfig.appName} Admin: Validação de Receita Pendente - #${prescriptionNumber}`;
  const currentYear = new Date().getFullYear();

  const preheaderText = `Receita #${prescriptionNumber} aguarda validação na plataforma Cúrati.`;

  let mjmlBody = generateEmailHeader({ brandConfig, preheaderText });

  mjmlBody += `
    <mj-text font-size="22px" font-weight="bold" color="${brandConfig.colors.ORANGE}" padding-bottom="15px">
      Validação de Nova Receita Necessária
    </mj-text>
    <mj-text padding-bottom="10px">Prezado(a) ${recipientName},</mj-text>
    <mj-text padding-bottom="20px">
      Uma nova prescrição (${prescriptionNumber}) foi submetida e requer a vossa validação na plataforma Cúrati.
    </mj-text>

    <mj-text font-size="16px" font-weight="bold" color="${brandConfig.colors.BLACK}" padding-bottom="5px">
      Detalhes da Prescrição:
    </mj-text>
    <mj-text padding-bottom="5px">• <strong>Número da Receita:</strong> #${prescriptionNumber}</mj-text>
    ${patientName ? `<mj-text padding-bottom="5px">• <strong>Paciente:</strong> ${patientName}</mj-text>` : ''}
    
    <mj-raw><div class="highlight-box" style="border-left-color: ${brandConfig.colors.ORANGE}; margin-top:0; margin-bottom:15px;"></mj-raw>
      <mj-text font-weight="bold" color="${brandConfig.colors.ORANGE2}" padding-bottom="5px">Ação Imediata Requerida:</mj-text>
      <mj-text color="${brandConfig.colors.ORANGE2}">
        Por favor, acedam à plataforma para rever e processar esta prescrição o mais breve possível.
      </mj-text>
    <mj-raw></div></mj-raw>
    
    <mj-spacer height="20px" />

    <mj-text font-size="13px">
      A vossa atenção rápida é crucial para o fluxo eficiente do tratamento dos pacientes.
    </mj-text>

    <mj-text padding-top="25px">Obrigado pela vossa dedicação,<br />Sistema ${brandConfig.appName}</mj-text>
  `;

  mjmlBody += generateEmailFooter({ brandConfig, showSupportEmail: false }); // Internal email, maybe no need for full support details

  const textBody = `
${brandConfig.appName} Admin: Validação de Receita Pendente - #${prescriptionNumber}

Prezada Equipa de Validação Cúrati,

Uma nova prescrição (${prescriptionNumber}) foi submetida e requer a vossa validação na plataforma Cúrati.

Detalhes da Prescrição:
- Número da Receita: #${prescriptionNumber}
${patientName ? `- Paciente: ${patientName}\n` : ''}
AÇÃO IMEDIATA REQUERIDA:
Por favor, acedam à plataforma para rever e processar esta prescrição o mais breve possível.


A vossa atenção rápida é crucial para o fluxo eficiente do tratamento dos pacientes.

Obrigado pela vossa dedicação,
Sistema ${brandConfig.appName}

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