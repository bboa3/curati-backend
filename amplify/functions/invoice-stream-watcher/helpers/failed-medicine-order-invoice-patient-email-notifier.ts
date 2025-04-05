import { env } from '$amplify/env/invoice-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { formatToMZN } from '../../helpers/number-formatter';

interface PatientEmailNotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceTotalAmount: number;
  invoiceDeepLink: string;
  invoiceDueDate: string;
  failureReason?: string
}

const client = new SESv2Client();
export async function failedMedicineOrderInvoicePatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  invoiceNumber,
  invoiceTotalAmount,
  invoiceDeepLink,
  invoiceDueDate,
  failureReason
}: PatientEmailNotifierInput) {
  const subject = `Cúrati: Falha no Pagamento - Fatura ${invoiceNumber}`;
  const formattedTotalAmount = formatToMZN(invoiceTotalAmount);
  const currentYear = new Date().getFullYear();
  const formattedDueDate = formatDateTimeNumeric(invoiceDueDate);

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  let reasonText = failureReason
    ? `Motivo reportado: ${failureReason}.`
    : 'Isto pode dever-se a fundos insuficientes, dados do cartão expirados/inválidos ou uma recusa temporária do seu banco.';


  const htmlBody = `
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
          h1 { color: #dc3545; font-size: 1.6em; } /* Red for failure/warning */
          p { margin-bottom: 12px; }
          strong { font-weight: 600; color: #111; }
          .highlight { background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 5px solid #f5c6cb; margin: 20px 0; } /* Reddish highlight */
          a.button { padding: 12px 25px; background-color: #ffc107; color: #333 !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: 500; border: 1px solid #e0a800} /* Yellow/Orange button */
          .footer { font-size: 0.8em; color: #777; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Problema no Processamento do Pagamento</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Lamentamos informar que ocorreu uma falha ao tentar processar o pagamento da sua fatura Cúrati Nº <strong>${invoiceNumber}</strong>, no valor de <strong>${formattedTotalAmount}</strong>.</p>
          <p>Esta fatura é referente à sua encomenda de medicamentos Nº ${orderNumber}. A data de vencimento original era ${formattedDueDate}.</p>

          <div class="highlight">
            <p><strong>Detalhes da Falha:</strong> ${reasonText}</p>
            <p><strong>Ação Necessária Urgente:</strong> Para evitar o cancelamento da sua encomenda ou a suspensão do seu serviço, é importante regularizar este pagamento.</p>
          </div>

          <p>Por favor, verifique os detalhes do seu método de pagamento ou tente novamente clicando no botão abaixo:</p>
          <p><a href="${invoiceDeepLink}" class="button">Resolver Pagamento / Atualizar Método</a></p>
          <p>Pode gerir os seus métodos de pagamento e tentar novamente através da secção "Pagamentos" ou "Faturação" na sua conta Cúrati.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Problema no Processamento do Pagamento\n\nPrezado(a) ${patientName},\n\nLamentamos informar que ocorreu uma falha ao tentar processar o pagamento da sua fatura Cúrati Nº ${invoiceNumber}, no valor de ${formattedTotalAmount}.\n\nEsta fatura é referente à sua encomenda de medicamentos Nº ${orderNumber}. A data de vencimento original era ${formattedDueDate}.\n\nDetalhes da Falha: ${reasonText}\n\nAção Necessária Urgente: Para evitar o cancelamento da sua encomenda ou a suspensão do seu serviço, é importante regularizar este pagamento.\n\nPor favor, verifique os detalhes do seu método de pagamento ou tente novamente acedendo ao link abaixo:\n${invoiceDeepLink}\n\nPode gerir os seus métodos de pagamento e tentar novamente através da secção "Pagamentos" ou "Faturação" na sua conta Cúrati.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
