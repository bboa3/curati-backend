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
  const currentYear = new Date().getFullYear();
  const subject = `Cúrati Driver: Nova Entrega Atribuída (${deliveryNumber})`;

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
                          <head>
                            <style>
                              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                              .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
                              h1 { color: #0056b3; font-size: 1.5em; margin-bottom: 15px;}
                              p { margin-bottom: 12px; }
                              strong { font-weight: 600; color: #111; }
                              a.link { color: #1BBA66; text-decoration: none; }
                              .footer { font-size: 0.8em; color: #777; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; }
                              .cta-button { display: inline-block; background-color: #1BBA66; color: #ffffff !important; /* Ensure text is white */ padding: 12px 25px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: 500; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h1>Nova Atribuição de Entrega</h1>
                              <p>Prezado(a) ${driverName},</p>
                              <p>Foi-lhe atribuída uma nova tarefa de entrega (Referência: <strong>${deliveryNumber}</strong>) através da aplicação Cúrati Driver.</p>
                              <p><strong>Ação Imediata Necessária:</strong></p>
                              <p>Por favor, aceda à aplicação Cúrati Driver assim que possível para:</p>
                              <ul>
                                <li>Rever todos os detalhes da entrega (recolha, destino, itens).</li>
                                <li>Aceitar a tarefa e iniciar a sua rota.</li>
                              </ul>
                              <a href="${deliveryDeepLink}" class="cta-button">Ver Detalhes da Entrega na App</a>
                              <p>A sua rapidez é essencial para garantirmos um serviço eficiente aos nossos clientes.</p>
                              <p>Obrigado pela sua colaboração.</p>
                              <p>Atenciosamente,</p>
                              <p><strong>Equipa de Logística Cúrati Saúde</strong></p> <div class="footer">
                                Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
                                Maputo, Moçambique.
                              </div>
                            </div>
                          </body>
                        </html>
                      `,
          },
          Text: {
            Data: `Nova Atribuição de Entrega\n\nPrezado(a) ${driverName},\n\nFoi-lhe atribuída uma nova tarefa de entrega (Referência: ${deliveryNumber}) através da aplicação Cúrati Driver.\n\nAção Imediata Necessária:\nPor favor, aceda à aplicação Cúrati Driver assim que possível para rever todos os detalhes da entrega, aceitar a tarefa e iniciar a sua rota.\n\nVer Detalhes na App: ${deliveryDeepLink}\n\nA sua rapidez é essencial.\n\nObrigado,\nEquipa de Logística Cúrati Saúde\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Maputo, Moçambique.`
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}
