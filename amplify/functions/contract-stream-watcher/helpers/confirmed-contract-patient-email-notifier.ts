import { env } from '$amplify/env/contract-stream-watcher';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { formatToMZN } from '../../helpers/number-formatter';
import { ContractStatus } from '../../helpers/types/schema';
import { convertContractStatus } from './contract-status';

const client = new SESv2Client();

const supportPhone = env.SUPPORT_PHONE;
const supportEmail = env.VERIFIED_SES_SUPPORT_EMAIL;

interface SendInput {
  patientName: string;
  serviceName: string;
  professionalName: string;
  contractStatus: ContractStatus;
  toAddresses: string[];
  contractNumber: string;
  invoiceNumber?: string;
  invoiceTotalAmount?: number;
  paymentDeepLink: string;
  invoiceDueDate?: string;
}

export async function confirmedContractPatientEmailNotifier({
  patientName,
  serviceName,
  professionalName,
  contractStatus,
  toAddresses,
  contractNumber,
  invoiceTotalAmount,
  paymentDeepLink,
  invoiceNumber,
  invoiceDueDate
}: SendInput) {

  let subject: string;
  let htmlBody: string;
  let textBody: string;

  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const baseHtmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; } h1 { color: #0A0D14; font-size: 1.5em; } h1.success { color: #1BBA66; } h1.failure { color: #dc3545; } p { margin-bottom: 12px; } strong { font-weight: 600; color: #111; } .highlight { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 5px solid #ffeeba; margin: 20px 0; } a.button { padding: 12px 25px; background-color: #1BBA66; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: 500; } .footer { font-size: 0.8em; color: #777; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; }</style></head>`;

  if (contractStatus === ContractStatus.ACTIVE) {
    if (!invoiceNumber || invoiceTotalAmount === undefined || !invoiceDueDate || !paymentDeepLink) {
      throw new Error(`Invoice details missing for ACTIVE contract ${contractNumber}`);
    }

    const formattedDueDate = formatDateTimeNumeric(invoiceDueDate);
    const formattedTotalAmount = formatToMZN(invoiceTotalAmount);
    subject = `Cúrati: Contrato ${contractNumber} Confirmado - Fatura Pronta!`;
    htmlBody = `
          ${baseHtmlHead}
          <body>
            <div class="container">
              <h1 class="success">Contrato Confirmado e Fatura Pronta!</h1>
              <p>Prezado(a) ${patientName},</p>
              <p>Excelente notícia! O seu contrato de serviço (Nº <strong>${contractNumber}</strong>) para "<strong>${serviceName}</strong>" com ${professionalName} foi confirmado com sucesso.</p>
              <h2>Fatura Gerada</h2>
              <p>Para dar seguimento, a fatura referente a este serviço já se encontra disponível para pagamento.</p>
              <ul>
                <li><strong>Número da Fatura:</strong> ${invoiceNumber}</li>
                <li><strong>Valor Total:</strong> ${formattedTotalAmount}</li>
                <li><strong>Data de Vencimento:</strong> ${formattedDueDate}</li>
              </ul>
              <div class="highlight">
                <p><strong>Ação Necessária:</strong> O pagamento desta fatura é o próximo passo para podermos agendar a(s) sua(s) consulta(s) ou serviço(s).</p>
              </div>
              <p>Por favor, aceda à plataforma Cúrati para visualizar a fatura detalhada e efectuar o pagamento:</p>
              <p><a href="${paymentDeepLink}" class="button" target="_blank">Ver Fatura e Pagar Agora</a></p>
              <p>Se tiver alguma questão sobre o contrato ou a fatura, contacte o nosso suporte.</p>
              <p>Atenciosamente,</p>
              <p><strong>Equipa Cúrati Saúde</strong></p>
              ${footerHtml}
            </div>
          </body>
          </html>
        `;
    textBody = `Contrato Confirmado e Fatura Pronta!\n\nPrezado(a) ${patientName},\n\nExcelente notícia! O seu contrato de serviço (Nº ${contractNumber}) para "${serviceName}" com ${professionalName} foi confirmado com sucesso.\n\nFatura Gerada:\n- Número da Fatura: ${invoiceNumber}\n- Valor Total: ${formattedTotalAmount}\n- Data de Vencimento: ${formattedDueDate}\n\nAção Necessária: O pagamento desta fatura é o próximo passo para agendar o(s) seu(s) serviço(s).\n\nAceda à plataforma Cúrati para pagar:\n${paymentDeepLink}\n\nQuestões? Contacte o suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  } else {
    const formattedContractStatus = convertContractStatus(contractStatus);
    subject = `Cúrati: Atualização Sobre o Seu Contrato (${contractNumber})`;
    htmlBody = `
          ${baseHtmlHead}
          <body>
            <div class="container">
              <h1 class="failure">Atualização do Contrato</h1>
              <p>Prezado(a) ${patientName},</p>
              <p>Gostaríamos de informar sobre o estado do seu contrato de serviço (Nº <strong>${contractNumber}</strong>) para "<strong>${serviceName}</strong>" com ${professionalName}.</p>
              <p>O estado atual do contrato é: <strong>${formattedContractStatus}</strong>.</p>
              <p>Infelizmente, o contrato não pôde ser ativado ou foi alterado conforme este estado.</p>
              <p><strong>O que fazer:</strong> Para mais detalhes ou para discutir os próximos passos, por favor, entre em contacto com a nossa equipa de suporte.</p>
              <p>Email Suporte: ${supportEmail}</p>
              <p>Telefone Suporte: ${supportPhone}</p>
              <p>Lamentamos qualquer inconveniente.</p>
              <p>Atenciosamente,</p>
              <p><strong>Equipa Cúrati Saúde</strong></p>
              ${footerHtml}
            </div>
          </body>
          </html>
        `;
    textBody = `Atualização do Contrato\n\nPrezado(a) ${patientName},\n\nGostaríamos de informar sobre o estado do seu contrato de serviço (Nº ${contractNumber}) para "${serviceName}" com ${professionalName}.\n\nO estado atual do contrato é: ${formattedContractStatus}.\nInfelizmente, o contrato não pôde ser ativado ou foi alterado conforme este estado.\nO que fazer: Para mais detalhes ou para discutir os próximos passos, por favor, entre em contacto com a nossa equipa de suporte.\n\nEmail Suporte: ${supportEmail}\nTelefone Suporte: ${supportPhone}\n\nLamentamos qualquer inconveniente.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;
  }

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    ReplyToAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}
