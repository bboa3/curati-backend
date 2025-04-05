import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { Address } from '../../helpers/types/schema';

interface NotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  deliveryNumber: string;
  deliveredAt: string;
  driverName: string;
  deliveryAddress: Address;
  ratingDeepLink: string;
  orderDeepLink: string;
}

const client = new SESv2Client();

export async function deliveryDeliveredPatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  deliveryNumber,
  deliveredAt,
  driverName,
  deliveryAddress,
  ratingDeepLink,
  orderDeepLink
}: NotifierInput) {
  const subject = `Cúrati: Encomenda ${orderNumber} Entregue com Sucesso!`;
  const currentYear = new Date().getFullYear();
  const formattedDeliveredAt = formatDateTimeNumeric(deliveredAt);
  const formattedAddress = `${deliveryAddress.addressLine1}, ${deliveryAddress.neighborhoodOrDistrict}`

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
          <h1 style="color: #179E57;">Encomenda Entregue!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Ótimas notícias! A sua encomenda de medicamentos Cúrati (Nº <strong>${orderNumber}</strong> / Entrega Nº <strong>${deliveryNumber}</strong>) foi entregue com sucesso.</p>

          <h2>Detalhes da Entrega:</h2>
          <ul>
            <li><strong>Entregue em:</strong> ${formattedDeliveredAt}</li>
            <li><strong>Entregue por:</strong> ${driverName}</li>
            <li><strong>Local de Entrega:</strong> <div class="address-box">${formattedAddress}</div></li>
          </ul>

          <p><strong>A sua opinião é muito importante para nós!</strong> Ajude-nos a melhorar, avaliando a sua experiência com a farmácia e a entrega:</p>
          <p><a href="${ratingDeepLink}" class="button button-rate">Avaliar Experiência Agora</a></p>

          <p>Pode também rever os detalhes finais da sua encomenda:</p>
          <p><a href="${orderDeepLink}" class="button button-details">Ver Detalhes da Encomenda</a></p>

          <p>Se verificar qualquer problema ou discrepância com a sua encomenda, por favor contacte o nosso suporte imediatamente.</p>
          <p>Obrigado por escolher a Cúrati para cuidar da sua saúde!</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Encomenda Entregue!\n\nPrezado(a) ${patientName},\n\nÓtimas notícias! A sua encomenda Cúrati (Nº ${orderNumber} / Entrega Nº ${deliveryNumber}) foi entregue com sucesso.\n\nDetalhes da Entrega:\n- Entregue em: ${formattedDeliveredAt}\n- Entregue por: ${driverName}\n- Local de Entrega: ${formattedAddress}\n\nA sua opinião é importante! Avalie a sua experiência:\n${ratingDeepLink}\n\nVer detalhes da encomenda:\n${orderDeepLink}\n\nSe houver qualquer problema, contacte o suporte imediatamente.\n\nObrigado por escolher a Cúrati!\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
