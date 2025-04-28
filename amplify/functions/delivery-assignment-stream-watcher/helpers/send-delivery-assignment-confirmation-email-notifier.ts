import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatTimeWithHourSuffix } from '../../helpers/date/formatter';

interface NotifierInput {
  toAddresses: string[];
  driverName: string;
  deliveryNumber: string;
  pharmacyName: string;
  pharmacyAddressSnippet: string;
  preferredDeliveryTimeStartAt: string;
  preferredDeliveryTimeEndAt: string;
  assignedDeliveryDeepLink: string;
}

const client = new SESv2Client();

export async function sendDeliveryAssignmentConfirmationEmailNotifier({ toAddresses, driverName, deliveryNumber, pharmacyName, pharmacyAddressSnippet, preferredDeliveryTimeStartAt, preferredDeliveryTimeEndAt, assignedDeliveryDeepLink }: NotifierInput) {
  const subject = `Cúrati Go: Entrega #${deliveryNumber} Confirmada - É Sua!`;
  const currentYear = new Date().getFullYear();

  const formattedDeliveryWindow = `${formatTimeWithHourSuffix(preferredDeliveryTimeStartAt)} - ${formatTimeWithHourSuffix(preferredDeliveryTimeEndAt)}`;

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © ${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique. (${new Date().toLocaleDateString('pt-MZ', { timeZone: 'Africa/Maputo' })})
      </div>
    `;
  const footerText = `\n\n---\nCopyright © ${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique. (${new Date().toLocaleDateString('pt-MZ', { timeZone: 'Africa/Maputo' })})`;


  const htmlBody = `
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          /* Base Styles (same as previous email templates) */
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; background-color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; background-color: #ffffff; }
          h1 { color: #127E47; font-size: 1.6em; margin-bottom: 20px; border-bottom: 2px solid #E6F7EE; padding-bottom: 10px; }
          h2 { color: #179E57; font-size: 1.3em; margin-top: 25px; margin-bottom: 10px; }
          p { margin-bottom: 14px; }
          strong { font-weight: 600; color: #0D5E38; }
          ul { margin: 15px 0; padding-left: 0; list-style: none; }
          li { margin-bottom: 10px; padding-left: 20px; position: relative; background-color: #F8F9FA; border: 1px solid #E2E3E7; border-radius: 4px; padding: 10px 10px 10px 35px; }
          li::before { content: '❯'; color: #1BBA66; font-weight: bold; display: inline-block; position: absolute; left: 12px; top: 10px; font-size: 1.2em; }
          li strong { display: inline-block; min-width: 160px; /* Adjust as needed */ color: #474954; }
          .highlight { background-color: #E6F7EE; padding: 15px 20px; border-radius: 5px; border-left: 5px solid #1BBA66; margin: 25px 0; color: #0D5E38; font-weight: 500; }
          .highlight p { margin-bottom: 5px; font-weight: normal;}
          a.button { padding: 12px 25px; background-color: #1BBA66; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; text-align: center; transition: background-color 0.2s ease; }
          a.button:hover { background-color: #179E57; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Entrega #${deliveryNumber} Confirmada!</h1>
          <p>Parabéns ${driverName}!</p>
          <p>Você foi o(a) mais rápido(a) e esta entrega agora é sua. Por favor, prepare-se para iniciar a rota.</p>

          <h2>Próximos Passos e Detalhes:</h2>
          <ul>
            <li><strong>Ação Imediata:</strong> Dirija-se ao local de recolha.</li>
            <li><strong>Recolha (Farmácia):</strong> ${pharmacyName} <span style="color:#555;">(${pharmacyAddressSnippet})</span></li>
            <li><strong>Entrega (Paciente):</strong> <span style="color:#555;">Abra a aplicação Cúrati Go para ver a rota completa</span></li>
            <li><strong>Janela de Entrega:</strong> ${formattedDeliveryWindow}</li>
          </ul>

          <div class="highlight">
             <p><strong>Importante:</strong> Abra a aplicação Cúrati Go para ver a rota completa, detalhes do pedido e para <strong>marcar o início da sua viagem</strong> assim que estiver a caminho da farmácia.</p>
          </div>

          <p style="text-align: center;">
             <a href="${assignedDeliveryDeepLink}" class="button">Ver Detalhes e Iniciar Rota na App</a>
          </p>

          <p>Obrigado pela sua prontidão e colaboração! Faça uma viagem segura.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Go</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Entrega #${deliveryNumber} Confirmada!\n\nParabéns ${driverName}!\n\nVocê foi o(a) mais rápido(a) e esta entrega agora é sua. Por favor, prepare-se para iniciar a rota.\n\nPróximos Passos e Detalhes:\n* Ação Imediata: Dirija-se ao local de recolha.\n* Recolha (Farmácia): ${pharmacyName} (${pharmacyAddressSnippet})\n* Entrega (Paciente): Abra a aplicação Cúrati Go para ver a rota completa\n* Janela de Entrega: ${formattedDeliveryWindow}\n\nIMPORTANTE: Abra a aplicação Cúrati Go para ver a rota completa, detalhes do pedido e para marcar o início da sua viagem assim que estiver a caminho da farmácia.\n\nVer Detalhes e Iniciar Rota na App: ${assignedDeliveryDeepLink}\n\nObrigado pela sua prontidão e colaboração! Faça uma viagem segura.\n\nAtenciosamente,\nEquipa Cúrati Go${footerText}`;

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
