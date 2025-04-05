import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';

interface NotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  pharmacyName: string;
  pickupTimestamp: string;
  ratingDeepLink: string;
  orderDeepLink: string;
}

const client = new SESv2Client();

export async function deliveryPickedUpPatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  pharmacyName,
  pickupTimestamp,
  ratingDeepLink,
  orderDeepLink
}: NotifierInput) {
  const subject = `Cúrati: Encomenda ${orderNumber} Retirada com Sucesso!`;
  const currentYear = new Date().getFullYear();
  const formattedPickupTimestamp = formatDateTimeNumeric(pickupTimestamp);

  const footerHtml = `
      <div class="footer">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; } h1 { color: #179E57; font-size: 1.6em; } p { margin-bottom: 14px; } strong { font-weight: 600; color: #0D5E38; } a.button { padding: 12px 25px; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: 500; border: none; } a.button-rate { background-color: #1BBA66; } a.button-rate:hover { background-color: #179E57; } a.button-details { background-color: #6c757d; } a.button-details:hover { background-color: #5a6268; } .footer { font-size: 0.85em; color: #777B8A; margin-top: 30px; border-top: 1px solid #E2E3E7; padding-top: 20px; text-align: center; }</style></head>`;

  const htmlBody = `
      ${htmlHead}
      <body>
        <div class="container">
          <h1>Encomenda Retirada!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Confirmamos que retirou com sucesso a sua encomenda de medicamentos (Nº <strong>${orderNumber}</strong>) na <strong>Farmácia ${pharmacyName}</strong> em ${formattedPickupTimestamp}.</p>
          <p>Esperamos que tudo esteja conforme esperado com os seus produtos.</p>

          <p><strong>Gostou da sua experiência na farmácia?</strong> A sua opinião ajuda outros pacientes:</p>
          <p><a href="${ratingDeepLink}" class="button button-rate">Avaliar a Farmácia</a></p>

          <p>Pode rever os detalhes da sua encomenda a qualquer momento:</p>
          <p><a href="${orderDeepLink}" class="button button-details">Ver Detalhes da Encomenda</a></p>

          <p>Se tiver alguma questão sobre os medicamentos recebidos, recomendamos contactar directamente a farmácia ou o nosso suporte ao cliente.</p>
          <p>Obrigado por utilizar o serviço de Retirada na Farmácia da Cúrati!</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Encomenda Retirada!\n\nPrezado(a) ${patientName},\n\nConfirmamos que retirou com sucesso a sua encomenda de medicamentos (Nº ${orderNumber}) na Farmácia ${pharmacyName} em ${formattedPickupTimestamp}.\n\nEsperamos que tudo esteja conforme esperado.\n\nGostou da experiência? Avalie a farmácia:\n${ratingDeepLink}\n\nPode rever os detalhes da encomenda:\n${orderDeepLink}\n\nSe tiver questões sobre os medicamentos, contacte a farmácia ou o nosso suporte.\n\nObrigado por utilizar o serviço de Retirada Cúrati!\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
