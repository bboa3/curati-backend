import { env } from '$amplify/env/invoice-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { formatToMZN } from '../../helpers/number-formatter';
dayjs.extend(utc);

interface PatientEmailNotifierInput {
  patientName: string;
  patientEmail: string;
  contractNumber: string;
  invoiceNumber: string;
  invoiceTotalAmount: number;
  invoiceDocumentUrl?: string;
  professionalName: string;
  serviceName: string;
}

const client = new SESv2Client();

export async function paidContractInvoicePatientEmailNotifier({
  patientName,
  patientEmail,
  contractNumber,
  invoiceNumber,
  invoiceTotalAmount,
  invoiceDocumentUrl,
  professionalName,
  serviceName,
}: PatientEmailNotifierInput) {
  const subject = `Cúrati: Pagamento Confirmado - Fatura ${invoiceNumber}`;
  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlBody = `
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
          h1 { color: #28a745; font-size: 1.6em; }
          p { margin-bottom: 12px; }
          strong { font-weight: 600; color: #111; }
          .highlight { background-color: #BCE4D3; padding: 15px; border-radius: 5px; border-left: 5px solid #46C281; margin: 20px 0; } /* Lighter green highlight */
          a.button { padding: 12px 25px; background-color: #1BBA66; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Pagamento Recebido com Sucesso!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Confirmamos que recebemos com sucesso o seu pagamento para a fatura <strong>${invoiceNumber}</strong>, no valor de <strong>${formatToMZN(invoiceTotalAmount)}</strong>.</p>
          <p>Este pagamento é referente ao seu contrato (Nº ${contractNumber}) para o serviço "<strong>${serviceName}</strong>" com ${professionalName}.</p>

          <div class="highlight">
            <p><strong>Próximos Passos:</strong> Com o seu pagamento confirmado, o agendamento para a sua consulta/serviço pode agora prosseguir.</p>
            <p>A nossa equipa ou o(a) profissional (${professionalName}) entrará em contacto consigo em breve para finalizar os detalhes do agendamento. Mantenha-se atento(a) às próximas comunicações.</p>
          </div>

          <p>Pode visualizar a sua fatura marcada como "PAGA" a qualquer momento na sua conta:</p>
          <p><a href="${invoiceDocumentUrl}" class="button" style="background-color:#6c757d;">Ver Histórico de Faturação</a></p>

          <p>Agradecemos a sua confiança e preferência pelos serviços da Cúrati.</p>
          <p>Se tiver alguma questão, estamos à sua disposição através do nosso suporte.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>

          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Pagamento Recebido com Sucesso!\n\nPrezado(a) ${patientName},\n\nConfirmamos que recebemos com sucesso o seu pagamento para a fatura ${invoiceNumber}, no valor de ${formatToMZN(invoiceTotalAmount)}.\n\nEste pagamento é referente ao seu contrato (Nº ${contractNumber}) para o serviço "${serviceName}" com ${professionalName}.\n\nPróximos Passos: Com o seu pagamento confirmado, o agendamento para a sua consulta/serviço pode agora prosseguir. A nossa equipa ou o(a) profissional (${professionalName}) entrará em contacto consigo em breve para finalizar os detalhes do agendamento.\n\nPode visualizar a sua fatura marcada como "PAGA" na sua conta: ${invoiceDocumentUrl}\n\nAgradecemos a sua confiança nos nossos serviços.\n\nSe tiver alguma questão, estamos à sua disposição através do nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: [patientEmail],
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