import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { formatToMZN } from '../../helpers/number-formatter';
import { InvoiceStatus } from '../../helpers/types/schema';
import { convertInvoiceStatus } from './invoice-status';

interface PatientEmailNotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceCreatedAt: string;
  invoiceDueDate: string;
  invoiceStatus: InvoiceStatus;
  invoiceSubTotal: number;
  invoiceDiscount: number;
  invoiceTotalTax: number;
  invoiceTotalAmount: number;
  invoiceDocumentUrl?: string
  totalDeliveryFee: number;
}

const client = new SESv2Client();
export async function newMedicineOrderInvoicePatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  invoiceNumber,
  invoiceCreatedAt,
  invoiceDueDate,
  invoiceStatus,
  invoiceSubTotal,
  invoiceDiscount,
  invoiceTotalTax,
  invoiceTotalAmount,
  invoiceDocumentUrl,
  totalDeliveryFee
}: PatientEmailNotifierInput) {
  const subject = `Cúrati: Detalhes da Sua Fatura (${invoiceNumber})`;
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
        body { font-family: sans-serif; }
        p { margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
        th { background-color: #f8f8f8; font-weight: 600; }
        .total-row td { border-top: 2px solid #333; font-weight: bold; font-size: 1.1em; }
      </style>
    </head>  
    <body>
        <h1>Detalhes da Sua Fatura Cúrati</h1>
        <p>Prezado(a) ${patientName},</p>
        <p>Segue os detalhes da fatura (${invoiceNumber}) gerada para a sua recente encomenda de medicamentos.</p>

        <h2>Sumário da Fatura</h2>
        <p>Número da Fatura: ${invoiceNumber}</p>
        <p>Data de Emissão: ${formattedInvoiceDate}</p>
        <p>Data de Vencimento: ${formattedDueDate}</p>
        <p>Referente ao Pedido Nº: ${orderNumber}</p>
        <p>Termos de Pagamento: Pagamento em 60 minutos</p>
        <p>Estado Atual: ${convertInvoiceStatus(invoiceStatus)}</p>

       <h2>Detalhes Financeiros</h2>
        <table>
          <tr>
            <td>Subtotal</td>
            <td style="text-align: right;">${formatToMZN(invoiceSubTotal)}</td>
          </tr>
          ${invoiceDiscount > 0 ? `<tr><td>Desconto Aplicado</td><td style="text-align: right;">-${formatToMZN(invoiceDiscount)}</td></tr>` : ''}
          ${invoiceTotalTax > 0 ? `<tr><td>Impostos (IVA)</td><td style="text-align: right;">${formatToMZN(invoiceTotalTax)}</td></tr>` : ''}
          ${totalDeliveryFee > 0 ? `<tr><td>Taxa de Entrega</td><td style="text-align: right;">${formatToMZN(totalDeliveryFee)}</td></tr>` : ''}
          <tr class="total-row">
            <td>Valor Total a Pagar</td>
            <td style="text-align: right;">${formatToMZN(invoiceTotalAmount)}</td>
          </tr>
        </table>

        <h2>Aceder à Fatura e Pagamento</h2>
        ${invoiceDocumentUrl ? `<p>Pode visualizar e descarregar a fatura completa em formato PDF aqui:</p><p><a href="${invoiceDocumentUrl}" target="_blank" rel="noopener noreferrer" style="padding: 10px 15px; background-color: #1BBA66; color: white; text-decoration: none; border-radius: 5px;">Ver/Descarregar Fatura (PDF)</a></p>` : '<p>A sua fatura detalhada está disponível na sua conta.</p>'}

        <p>Agradecemos a sua preferência!</p>

        <p>Se tiver alguma dúvida, não hesite em contactar o nosso suporte.</p>

        <p>Atenciosamente,</p>
        <p><strong>Equipa Cúrati Saúde</strong></p>

       ${footerHtml}
    </body>
    </html>
  `;

  const textBody = `Detalhes da Sua Fatura Cúrati\n\nPrezado(a) ${patientName},\n\nSegue os detalhes da fatura (${invoiceNumber}) gerada para a sua recente encomenda de medicamentos.\n\nSumário da Fatura:\n- Número da Fatura: ${invoiceNumber}\n- Data de Emissão: ${formattedInvoiceDate}\n- Data de Vencimento: ${formattedDueDate}\n- Referente ao Pedido Nº: ${orderNumber}\n- Termos de Pagamento: 12 horas\n- Estado Atual: ${convertInvoiceStatus(invoiceStatus)}\n\nDetalhes Financeiros:\n- Subtotal: ${formatToMZN(invoiceSubTotal)}\n${invoiceDiscount > 0 ? `- Desconto Aplicado: -${formatToMZN(invoiceDiscount)}\n` : ''}${invoiceTotalTax > 0 ? `- Impostos (IVA): ${formatToMZN(invoiceTotalTax)}\n` : ''}- Valor Total a Pagar: ${formatToMZN(invoiceTotalAmount)}\n\nAceder à Fatura e Pagamento:\n${invoiceDocumentUrl ? `Pode visualizar/descarregar a fatura completa em PDF aqui: ${invoiceDocumentUrl}\n` : 'A sua fatura detalhada está disponível na sua conta Cúrati.'}\n\nAgradecemos a sua preferência!\n\nSe tiver alguma dúvida, não hesite em contactar o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
