import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

const client = new SESv2Client();
export async function newOrderPharmacyEmailNotifier(
  toAddresses: string[],
  orderNumber: string,
) {
  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    ReplyToAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
    Content: {
      Simple: {
        Subject: {
          Data: "Novo Pedido de Medicamentos - Ação Necessária",
        },
        Body: {
          Html: {
            Data: `
            <html>
            <head><style>body { font-family: sans-serif; } p { margin-bottom: 10px; }</style></head>
              <body>
                <h1>Novo Pedido de Medicamentos - Ação Necessária</h1>
                <p>Prezado(a) farmacêutico(a),</p>
                <p>Óptima notícia! Um novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega.</p>
                <p>Por favor, acesse o sistema para processar este pedido o mais breve possível.</p>
                <p>Atenciosamente,</p>
                <p>Cúrati - A sua saúde é a nossa prioridade.</p>
                ${footerHtml}
              </body>
            </html>
          `,
          },
          Text: {
            Data: `Novo Pedido de Medicamentos - Ação Necessária\n\nPrezado(a) farmacêutico(a),\n\nUm novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega. \n\nPor favor, acesse o sistema para processar este pedido o mais breve possível.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}
