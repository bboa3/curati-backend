import { env } from '$amplify/env/new-medicine-order-pharmacy-notifier';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

const sesClient = new SESv2Client();

export async function sendOrderNotificationEmail(
  toAddresses: string[],
  orderNumber: string,
) {
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
            <body>
              <h1>Novo Pedido de Medicamentos - Ação Necessária</h1>
              <p>Prezado(a) farmacêutico(a),</p>
              <p>Um novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega.</p>
              <p>Por favor, acesse o sistema para processar este pedido o mais breve possível.</p>
              <p>Atenciosamente,</p>
              <p>Cúrati - A sua saúde é a nossa prioridade.</p>
              <p>Copyright © 2024-2025 Cúrati Saúde, LDA. Todos os direitos reservados.</p>
            </body>
            </html>
          `,
          },
          Text: {
            Data: `Novo Pedido de Medicamentos - Ação Necessária\n\nPrezado(a) farmacêutico(a),\n\nUm novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega. \n\nPor favor, acesse o sistema para processar este pedido o mais breve possível.\n\nAtenciosamente,\n\nCopyright © 2024-2025 Cúrati Saúde, LDA. Todos os direitos reservados.`,
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await sesClient.send(sendEmailCommand);
}
