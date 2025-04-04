import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { formatToMZN } from '../../helpers/number-formatter';
import { InvoiceStatus, PaymentTermsType } from '../../helpers/types/schema';
import { convertInvoiceStatus } from './invoice-status';
import { convertPaymentTermsType } from './payment-terms';

interface PatientEmailNotifierInput {
  patientName: string;
  patientEmail: string;
  contractNumber: string;
  paymentTerms: PaymentTermsType;
  invoiceNumber: string;
  invoiceCreatedAt: string;
  invoiceDueDate: string;
  invoiceStatus: InvoiceStatus;
  invoiceSubTotal: number;
  invoiceDiscount: number;
  invoiceTotalTax: number;
  invoiceTotalAmount: number;
  invoiceDocumentUrl?: string;
  professionalName: string;
  serviceName: string;
  invoiceDeepLink: string;

}

const client = new SESv2Client();

export async function newContractInvoicePatientEmailNotifier({
  patientName,
  patientEmail,
  contractNumber,
  paymentTerms,
  invoiceNumber,
  invoiceCreatedAt,
  invoiceDueDate,
  invoiceStatus,
  invoiceSubTotal,
  invoiceDiscount,
  invoiceTotalTax,
  invoiceTotalAmount,
  invoiceDocumentUrl,
  professionalName,
  serviceName,
  invoiceDeepLink
}: PatientEmailNotifierInput) {
  const subject = `Cúrati: Fatura (${invoiceNumber}) Pronta Para Pagamento - ${serviceName}`;
  const formattedInvoiceDate = formatDateTimeNumeric(invoiceCreatedAt);
  const formattedDueDate = formatDateTimeNumeric(invoiceDueDate);
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
          h1 { color: #0A0D14; font-size: 1.5em; margin-bottom: 15px; }
          h2 { color: #333; font-size: 1.3em; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;}
          p { margin-bottom: 12px; }
          strong { font-weight: 600; color: #111; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
          th { background-color: #f8f8f8; font-weight: 600; }
          .total-row td { border-top: 2px solid #333; font-weight: bold; font-size: 1.1em; }
          a.button { padding: 12px 25px; background-color: #1BBA66; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: 500; }
          a.button-pay { background-color: #28a745; }
          .footer { font-size: 0.8em; color: #777; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; }
        </style>
      </head>
      <body>
          <div class="container">
            <h1>Sua Fatura Cúrati (${invoiceNumber})</h1>
            <p>Prezado(a) ${patientName},</p>
            <p>Segue em anexo os detalhes da fatura (${invoiceNumber}) referente ao serviço contratado.</p>

            <h2>Sumário da Fatura</h2>
            <p><strong>Número da Fatura:</strong> ${invoiceNumber}</p>
            <p><strong>Data de Emissão:</strong> ${formattedInvoiceDate}</p>
            <p><strong>Data de Vencimento:</strong> ${formattedDueDate}</p>
            <p><strong>Referente ao Contrato Nº:</strong> ${contractNumber}</p>
            <p><strong>Serviço:</strong> ${serviceName}</p>
            <p><strong>Profissional:</strong> ${professionalName}</p>
            <p><strong>Termos de Pagamento:</strong> ${convertPaymentTermsType(paymentTerms)}</p>
            <p><strong>Estado Atual:</strong> ${convertInvoiceStatus(invoiceStatus)}</p>

            <h2>Detalhes Financeiros</h2>
            <table>
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right;">${formatToMZN(invoiceSubTotal)}</td>
              </tr>
              ${invoiceDiscount > 0 ? `<tr><td>Desconto Aplicado</td><td style="text-align: right;">-${formatToMZN(invoiceDiscount)}</td></tr>` : ''}
              ${invoiceTotalTax > 0 ? `<tr><td>Impostos (IVA)</td><td style="text-align: right;">${formatToMZN(invoiceTotalTax)}</td></tr>` : ''}
              <tr class="total-row">
                <td>Valor Total a Pagar</td>
                <td style="text-align: right;">${formatToMZN(invoiceTotalAmount)}</td>
              </tr>
            </table>

            <h2>Pagamento e Acesso à Fatura</h2>
            <p>Para garantir o agendamento do seu serviço, por favor, efectue o pagamento utilizando o link abaixo:</p>
            <p><a href="${invoiceDeepLink}" class="button button-pay">Efectuar Pagamento Agora</a></p>

            ${invoiceDocumentUrl ? `<p>Pode também visualizar e descarregar a fatura completa em formato PDF:</p><p><a href="${invoiceDocumentUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 5px; color: #46C281;">Ver/Descarregar Fatura (PDF)</a></p>` : '<p>A sua fatura detalhada também está disponível na secção "Faturação" da sua conta Cúrati.</p>'}

            <p>Agradecemos a sua preferência e estamos à disposição para qualquer dúvida.</p>

            <p>Atenciosamente,</p>
            <p><strong>Equipa Cúrati Saúde</strong></p>

           ${footerHtml}
         </div>
      </body>
      </html>
  `;

  const textBody = `Detalhes da Sua Fatura Cúrati (${invoiceNumber})\n\nPrezado(a) ${patientName},\n\nSegue em anexo os detalhes da fatura (${invoiceNumber}) referente ao serviço contratado.\n\nSumário da Fatura:\n- Número da Fatura: ${invoiceNumber}\n- Data de Emissão: ${formattedInvoiceDate}\n- Data de Vencimento: ${formattedDueDate}\n- Referente ao Contrato Nº: ${contractNumber}\n- Serviço: ${serviceName}\n- Profissional: ${professionalName}\n- Termos de Pagamento: ${convertPaymentTermsType(paymentTerms)}\n- Estado Atual: ${convertInvoiceStatus(invoiceStatus)}\n\nDetalhes Financeiros:\n- Subtotal: ${formatToMZN(invoiceSubTotal)}\n${invoiceDiscount > 0 ? `- Desconto Aplicado: -${formatToMZN(invoiceDiscount)}\n` : ''}${invoiceTotalTax > 0 ? `- Impostos (IVA): ${formatToMZN(invoiceTotalTax)}\n` : ''}- Valor Total a Pagar: ${formatToMZN(invoiceTotalAmount)}\n\nPagamento e Acesso à Fatura:\nPara garantir o agendamento do seu serviço, por favor, efectue o pagamento utilizando o link abaixo:\n${invoiceDeepLink}\n\n${invoiceDocumentUrl ? `Visualizar/Descarregar Fatura (PDF): ${invoiceDocumentUrl}\n` : 'A sua fatura detalhada também está disponível na secção "Faturação" da sua conta Cúrati.\n'}\n\nAgradecemos a sua preferência!\n\nSe tiver alguma dúvida, não hesite em contactar o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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