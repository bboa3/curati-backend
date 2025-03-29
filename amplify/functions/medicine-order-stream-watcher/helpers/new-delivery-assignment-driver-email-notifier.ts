import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

interface NotifierInput {
  toAddresses: string[];
  deliveryNumber: string;
  driverName: string;
  deliveryDeepLink: string;
}

const client = new SESv2Client();

export async function newDeliveryAssignmentDriverEmailNotifier({ toAddresses, deliveryNumber, driverName, deliveryDeepLink }: NotifierInput) {
  const subject = `Cúrati Driver: Nova Entrega Atribuída (${deliveryNumber})`;
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
      ToAddresses: toAddresses
    },
    ReplyToAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: `
                        <html>
                         <head><style>body { font-family: sans-serif; } p { margin-bottom: 10px; }</style></head>
                          <body>
                              <h1>Nova Atribuição de Entrega</h1>
                              <p>Prezado(a) ${driverName},</p>
                              <p>Foi-lhe atribuída uma nova tarefa de entrega (Referência: <strong>${deliveryNumber}</strong>) através da aplicação Cúrati Driver.</p>
                              <p><strong>Ação Imediata Necessária:</strong></p>
                              <p>Por favor, aceda à aplicação Cúrati Driver:</p>
                              <ul>
                                <li>Rever todos os detalhes da entrega (recolha, destino, itens).</li>
                                <li>Aceitar a tarefa e iniciar a sua rota.</li>
                              </ul>
                              <a href="${deliveryDeepLink}" target="_blank" rel="noopener noreferrer" style="padding: 10px 15px; background-color: #1BBA66; color: white; text-decoration: none; border-radius: 5px;">Ver Detalhes da Entrega na App</a>
                              <p>A sua rapidez é essencial para garantirmos um serviço eficiente aos nossos clientes.</p>
                              <p>Obrigado pela sua colaboração.</p>
                              <p>Atenciosamente,</p>
                              ${footerHtml}
                          </body>
                        </html>
                      `,
          },
          Text: {
            Data: `Nova Atribuição de Entrega\n\nPrezado(a) ${driverName},\n\nFoi-lhe atribuída uma nova tarefa de entrega (Referência: ${deliveryNumber}) através da aplicação Cúrati Driver.\n\nAção Imediata Necessária:\nPor favor, aceda à aplicação Cúrati Driver e rever todos os detalhes da entrega, aceitar a tarefa e iniciar a sua rota.\n\nVer Detalhes na App: ${deliveryDeepLink}\n\nA sua rapidez é essencial.\n\nObrigado,\nEquipa de Logística Cúrati Saúde${footerText}`,
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}
