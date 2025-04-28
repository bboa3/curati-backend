import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

interface NotifierInput {
  toAddresses: string[];
  driverName: string;
  deliveryNumber: string;
  deliveryOpportunityDeepLink: string;
}

const client = new SESv2Client();

export async function sendDeliveryOpportunityEmailNotifier({ toAddresses, deliveryNumber, driverName, deliveryOpportunityDeepLink }: NotifierInput) {
  const subject = `Cúrati Go: Nova Oportunidade de Entrega! (${deliveryNumber})`;
  const currentYear = new Date().getFullYear();

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © ${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © ${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;
  const htmlBody = `
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          /* Base Styles from sendAppointmentConfirmationRequestEmail */
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #2F303A; /* --color-black-800 */
            line-height: 1.6;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
           }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 25px;
            border: 1px solid #E2E3E7; /* --color-black-100 */
            border-radius: 8px;
            background-color: #ffffff;
          }
          h1 {
            color: #127E47; /* --color-primary-700 */
            font-size: 1.6em;
            margin-bottom: 20px;
            border-bottom: 2px solid #E6F7EE; /* --color-primary-50 */
            padding-bottom: 10px;
          }
          p { margin-bottom: 14px; }
          strong {
            font-weight: 600;
            color: #0D5E38; /* --color-primary-800 */
          }
           /* Highlight Box */
          .highlight {
            background-color: #E6F7EE; /* --color-primary-50 */
            padding: 15px 20px;
            border-radius: 5px;
            border-left: 5px solid #1BBA66; /* --color-primary-500 */
            margin: 25px 0;
            color: #0D5E38; /* --color-primary-800 */
            font-weight: 500;
          }
          .highlight p { margin-bottom: 5px; font-weight: normal;}
          .highlight strong { color: #0D5E38; } /* Ensure strong inside highlight is dark green */

           /* Button Styles */
          a.button {
            padding: 12px 25px;
            background-color: #1BBA66; /* --color-primary-500 */
            color: #ffffff !important; /* White text, !important for email client overrides */
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 15px;
            font-weight: 500;
            border: none;
            text-align: center;
            transition: background-color 0.2s ease;
          }
          a.button:hover {
             background-color: #179E57; /* --color-primary-600 */
          }
          /* Small text style for urgency note */
          .small-text {
            font-size: 0.9em;
            color: #474954; /* --color-black-700 */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Nova Oportunidade de Entrega Cúrati Go!</h1>
          <p>Prezado(a) ${driverName},</p>
          <p>Temos uma nova oportunidade de entrega (Ref: <strong>${deliveryNumber}</strong>) disponível na sua área e gostaríamos de lhe oferecer!</p>
          <p class="small-text">Esta oferta foi enviada a um número limitado de motoristas disponíveis como você.</p>

          <div class="highlight">
             <strong>Aja Rápido!</strong>
             <p>Para garantir esta entrega, você deve ser o(a) <strong>primeiro(a) motorista a aceitar</strong>.</p>
             <p>Esta oportunidade está disponível por um <strong>tempo limitado</strong>.</p>
          </div>

          <p>Reveja rapidamente os detalhes e clique abaixo para aceitar se estiver disponível:</p>

          <p style="text-align: center;">
             <a href="${deliveryOpportunityDeepLink}" class="button">Ver e Aceitar Oportunidade na App</a>
          </p>

          <p>Se não puder aceitar, não precisa fazer nada. A oferta expirará automaticamente.</p>
          <p>Agradecemos a sua disponibilidade e rápida resposta!</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Go</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Nova Oportunidade de Entrega Cúrati Go!\n\nPrezado(a) ${driverName},\n\nTemos uma nova oportunidade de entrega (Ref: ${deliveryNumber}) disponível na sua área e gostaríamos de lhe oferecer!\n\nEsta oferta foi enviada a um número limitado de motoristas disponíveis como você.\n\n-- Aja Rápido! --\nPara garantir esta entrega, você deve ser o(a) PRIMEIRO(A) motorista a aceitar.\nEsta oportunidade está disponível por um tempo limitado.\n------------------\n\nReveja rapidamente os detalhes e clique no link abaixo para aceitar se estiver disponível:\n\nVer e Aceitar na App: ${deliveryOpportunityDeepLink}\n\nSe não puder aceitar, não precisa fazer nada. A oferta expirará automaticamente.\n\nAgradecemos a sua disponibilidade e rápida resposta!\n\nAtenciosamente,\nEquipa Cúrati Go${footerText}`;

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
            Data: htmlBody
          },
          Text: {
            Data: textBody
          },
        },
      },
    },
  };

  const sendEmailCommand = new SendEmailCommand(params);

  return await client.send(sendEmailCommand);
}
