import { env } from '$amplify/env/new-medicine-order-pharmacy-notifier';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

const client = new SESv2Client();

export async function sendNotificationEmail(
  toAddresses: string[],
  prescriptionNumber: string,
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
          Data: "Nova Receita para Validar - Ação Necessária",
        },
        Body: {
          Html: {
            Data: `
            <html>
            <body>
              <h1>Nova Receita para Validar - Ação Necessária</h1>
              <p>Prezado(a) farmacêutico(a),</p>
              <p>Um novo pedido de validação de receita (Código da Receita: ${prescriptionNumber}) foi recebida.</p>
              <p>Por favor, acesse o sistema para processar este pedido o mais breve possível.</p>
              <p>Atenciosamente,</p>
              <p>Cúrati - A sua saúde é a nossa prioridade.</p>
              <p>Copyright © 2024-2025 Cúrati Saúde, LDA. Todos os direitos reservados.</p>
            </body>
            </html>
          `,
          },
          Text: {
            Data: `Nova Receita para Validar - Ação Necessária\n\nPrezado(a) farmacêutico(a),\n\nUm novo pedido de validação de receita (Código da Receita: ${prescriptionNumber}) foi recebida. \n\nPor favor, acesse o sistema para processar este pedido o mais breve possível.\n\nAtenciosamente,\n\nCopyright © 2024-2025 Cúrati Saúde, LDA. Todos os direitos reservados.`,
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}
