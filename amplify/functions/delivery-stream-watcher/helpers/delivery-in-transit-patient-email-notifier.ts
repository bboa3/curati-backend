import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatETA } from '../../helpers/date/formatter';

interface NotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  deliveryNumber: string;
  driverName: string;
  pickedUpAt: string;
  estimatedDeliveryDuration: number;
  trackingLink: string;
}

const client = new SESv2Client();

export async function deliveryInTransitPatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  deliveryNumber,
  driverName,
  pickedUpAt,
  estimatedDeliveryDuration,
  trackingLink,
}: NotifierInput) {
  const currentYear = new Date().getFullYear();
  const subject = `Cúrati: Entrega ${deliveryNumber} Em Trânsito - Encomenda ${orderNumber}`;
  const formattedETA = formatETA(pickedUpAt, estimatedDeliveryDuration);

  const footerHtml = `
      <div class="footer">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; } h1 { color: #179E57; font-size: 1.6em; margin-bottom: 15px;} p { margin-bottom: 14px; } strong { font-weight: 600; color: #0D5E38; } .highlight { background-color: #E6F7EE; /* Light green highlight */ padding: 15px 20px; border-radius: 5px; border-left: 5px solid #1BBA66; /* Primary green border */ margin: 25px 0; color: #0D5E38; } a.button { padding: 12px 25px; background-color: #1BBA66; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; } a.button:hover { background-color: #179E57; } .footer { font-size: 0.85em; color: #777B8A; margin-top: 30px; border-top: 1px solid #E2E3E7; padding-top: 20px; text-align: center; }</style></head>`;

  const htmlBody = `
      ${htmlHead}
      <body>
        <div class="container">
          <h1>Sua Encomenda Está em Trânsito!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Atualização sobre a sua encomenda Cúrati (Nº Pedido <strong>${orderNumber}</strong> / Entrega Nº <strong>${deliveryNumber}</strong>):</p>
          <p>O motorista, <strong>${driverName}</strong>, já está em trânsito e a dirigir-se ao seu local de entrega.</p>

          <div class="highlight">
            <p><strong>Estimativa de Entrega:</strong> Mantém-se ${formattedETA}.</p>
            <p>Por favor, esteja atento(a) e preparado(a) para receber a encomenda.</p>
          </div>

          <p>Pode acompanhar a localização do motorista e o progresso da entrega em tempo real na aplicação Cúrati:</p>
          <p><a href="${trackingLink}" class="button">Acompanhar Entrega ao Vivo</a></p>

          <p>Se precisar de contactar o suporte sobre esta entrega, por favor tenha o número da entrega (${deliveryNumber}) à mão.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Sua Encomenda Está em Trânsito!\n\nPrezado(a) ${patientName},\n\nAtualização sobre a sua encomenda Cúrati (Nº Pedido ${orderNumber} / Entrega Nº ${deliveryNumber}):\nO motorista, ${driverName}, já está em trânsito para o seu local de entrega.\n\nEstimativa de Entrega: Mantém-se ${formattedETA}.\nPor favor, esteja atento(a) e preparado(a) para receber a encomenda.\n\nAcompanhe ao vivo na app Cúrati:\n${trackingLink}\n\nSe precisar de contactar o suporte, use a referência de entrega ${deliveryNumber}.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: [patientEmail]
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
