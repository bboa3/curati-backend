import { env } from '$amplify/env/delivery-assignment-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatTimeWithHourSuffix } from '../../helpers/date/formatter';

interface NotifierInput {
  toAddresses: string[];
  patientName: string;
  deliveryNumber: string;
  preferredDeliveryTimeStartAt: string;
  preferredDeliveryTimeEndAt: string;
  deliveryTrackingDeepLink: string;
}

const client = new SESv2Client();

export async function sendDriverAssignedPatientEmailNotifier({ toAddresses, patientName, deliveryNumber, preferredDeliveryTimeStartAt, preferredDeliveryTimeEndAt, deliveryTrackingDeepLink }: NotifierInput) {
  const subject = `Cúrati: Boas Notícias! Motorista a caminho para a sua entrega #${deliveryNumber}`;
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
          .highlight { background-color: #E6F7EE; padding: 15px 20px; border-radius: 5px; border-left: 5px solid #1BBA66; margin: 25px 0; color: #0D5E38; font-weight: 500; }
          .highlight p { margin-bottom: 5px; font-weight: normal;}
          a.button { padding: 12px 25px; background-color: #1BBA66; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; text-align: center; transition: background-color 0.2s ease; }
          a.button:hover { background-color: #179E57; }
          .info-box { background-color: #F8F9FA; border: 1px solid #E2E3E7; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
          .info-box p { margin-bottom: 8px; }
          .info-box strong { color: #474954;} /* Slightly lighter strong for info */
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Boas Notícias Sobre a Sua Entrega!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Temos uma excelente notícia! Já encontrámos um motorista para a sua entrega Cúrati (Referência: <strong>#${deliveryNumber}</strong>).</p>

          <div class="info-box">
            <p><strong>Status Atual:</strong> A caminho da farmácia para recolher o seu pedido.</p>
          </div>

          <p>Assim que o pedido for recolhido na farmácia, o(a) motorista seguirá diretamente para o seu endereço.</p>
          <p>Lembre-se que a janela de entrega prevista é: <strong>${formattedDeliveryWindow}</strong>.</p>

          <div class="highlight">
             <p>Acompanhe cada passo! Você pode ver a localização do motorista em tempo real diretamente na aplicação Cúrati.</p>
          </div>

          <p style="text-align: center;">
             <a href="${deliveryTrackingDeepLink}" class="button">Acompanhar a Minha Entrega</a>
          </p>

          <p>Recomendamos que esteja atento(a) às notificações da aplicação para atualizações sobre a chegada.</p>

          <p>Agradecemos a sua preferência e confiança!</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Boas Notícias Sobre a Sua Entrega!\n\nPrezado(a) ${patientName},\n\nTemos uma excelente notícia! Já encontrámos um motorista para a sua entrega Cúrati (Referência: #${deliveryNumber}).\n\n-- Detalhes --\nStatus Atual: A caminho da farmácia para recolher o seu pedido.\n-------------\n\nAssim que o pedido for recolhido na farmácia, o(a) motorista seguirá diretamente para o seu endereço.\n\nA janela de entrega prevista é: ${formattedDeliveryWindow}.\n\nAcompanhe cada passo! Você pode ver a localização do motorista em tempo real diretamente na aplicação Cúrati.\n\nAcompanhar a Minha Entrega: ${deliveryTrackingDeepLink}\n\nRecomendamos que esteja atento(a) às notificações da aplicação para atualizações sobre a chegada.\n\nAgradecemos a sua preferência e confiança!\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
