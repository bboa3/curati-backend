import { env } from '$amplify/env/invoice-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatToMZN } from '../../helpers/number-formatter';
import { DeliveryType } from '../../helpers/types/schema';

interface PatientEmailNotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceTotalAmount: number;
  pharmacyName: string;
  deliveryType: DeliveryType;
  invoiceDeepLink: string;
}

const client = new SESv2Client();
export async function paidMedicineOrderInvoicePatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  invoiceNumber,
  invoiceTotalAmount,
  pharmacyName,
  deliveryType,
  invoiceDeepLink
}: PatientEmailNotifierInput) {
  const subject = `Cúrati: Pagamento Confirmado - Preparação da Encomenda ${orderNumber}`;
  const formattedTotalAmount = formatToMZN(invoiceTotalAmount);
  const currentYear = new Date().getFullYear();

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const nextStepText = deliveryType === DeliveryType.PICKUP
    ? "Receberá uma nova notificação assim que a sua encomenda estiver pronta para retirada na farmácia."
    : "Receberá uma nova notificação assim que a sua encomenda estiver pronta para entrega e quando for despachada.";


  const htmlBody = `
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
          h1 { color: #28a745; font-size: 1.6em; } /* Green for success */
          p { margin-bottom: 12px; }
          strong { font-weight: 600; color: #111; }
          .highlight { background-color: #BCE4D3; padding: 15px; border-radius: 5px; border-left: 5px solid #46C281; margin: 20px 0; } /* Lighter green highlight */
          a.button { padding: 12px 25px; background-color: #1BBA66; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: 500; }
         </style>
      </head>
      <body>
        <div class="container">
          <h1>Obrigado Pelo Seu Pagamento!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Confirmamos o recebimento do seu pagamento para a fatura <strong>${invoiceNumber}</strong> (referente à encomenda <strong>${orderNumber}</strong>), no valor de <strong>${formattedTotalAmount}</strong>.</p>

          <div class="highlight">
            <p><strong>Estado da Encomenda:</strong> Com o pagamento confirmado, a Farmácia <strong>${pharmacyName}</strong> já iniciou o processo de preparação da sua encomenda.</p>
            <p><strong>Próximos Passos:</strong> ${nextStepText}</p>
          </div>

          <p>Pode acompanhar o estado da sua encomenda ou visualizar a fatura paga na sua conta:</p>
          <p><a href="${invoiceDeepLink}" class="button">Ver Encomenda / Fatura</a></p>

          <p>Agradecemos a sua preferência!</p>
          <p>Se tiver alguma questão sobre a sua encomenda ou pagamento, por favor contacte o nosso suporte.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Obrigado Pelo Seu Pagamento!\n\nPrezado(a) ${patientName},\n\nConfirmamos o recebimento do seu pagamento para a fatura ${invoiceNumber} (referente à encomenda ${orderNumber}), no valor de ${formattedTotalAmount}.\n\nEstado da Encomenda: Com o pagamento confirmado, a Farmácia ${pharmacyName} já iniciou o processo de preparação da sua encomenda.\n\nPróximos Passos: ${nextStepText}\n\nPode acompanhar o estado da sua encomenda ou visualizar a fatura paga na sua conta: ${invoiceDeepLink}\n\nAgradecemos a sua preferência!\n\nSe tiver alguma questão, por favor contacte o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
