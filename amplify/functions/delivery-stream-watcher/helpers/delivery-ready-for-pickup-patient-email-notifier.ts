import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { Address } from '../../helpers/types/schema';

interface NotifierInput {
  patientEmail: string;
  pharmacyAddress: Address;
  pharmacyName: string;
  orderNumber: string;
  patientName: string;
}

const client = new SESv2Client();

export async function deliveryReadyForPickupPatientEmailNotifier({ patientEmail, pharmacyAddress, pharmacyName, orderNumber, patientName }: NotifierInput) {
  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const baseHtmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; } h1 { color: #0056b3; font-size: 1.5em; } p { margin-bottom: 12px; } strong { color: #333; } a.button { padding: 12px 20px; background-color: #28a745; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; } .address { background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px; }</style></head>`;

  const subject = `Cúrati: Sua Encomenda (${orderNumber}) Está Pronta para Retirada!`;
  const address = `${pharmacyAddress.addressLine1}, ${pharmacyAddress.neighborhoodOrDistrict}, ${pharmacyAddress.city}`

  const htmlBody = `
          <html>
          ${baseHtmlHead}
          <body>
              <h1>Encomenda Pronta para Retirada</h1>
              <p>Prezado(a) ${patientName},</p>
              <p>Óptima notícia! A sua encomenda de medicamentos (Nº <strong>${orderNumber}</strong>) está pronta e aguarda a sua retirada.</p>
              <h2>Detalhes da Farmácia:</h2>
              <p><strong>Farmácia:</strong> ${pharmacyName}</p>
              <p><strong>Endereço:</strong></p>
              <div class="address">${address}</div>
              <p><strong>Instruções:</strong> Por favor, dirija-se à farmácia durante o horário de funcionamento para levantar a sua encomenda. Recomendamos que verifique o horário directamente com a farmácia ou na nossa plataforma.</p>
              <p>Não se esqueça de levar um documento de identificação e, se possível, o número da sua encomenda (${orderNumber}) para facilitar o processo.</p>
              <p>Se tiver alguma dúvida, por favor contacte directamente a farmácia ou o nosso suporte.</p>
              <p>Atenciosamente,</p>
              <p><strong>Equipa Cúrati Saúde</strong></p>
              ${footerHtml}
            </div>
          </body>
          </html>
        `;
  const textBody = `Encomenda Pronta para Retirada\n\nPrezado(a) ${patientName},\n\nÓptima notícia! A sua encomenda de medicamentos (Nº ${orderNumber}) está pronta e aguarda a sua retirada.\n\nDetalhes da Farmácia:\n- Farmácia: ${pharmacyName}\n- Endereço: ${pharmacyAddress}\n\nInstruções: Por favor, dirija-se à farmácia durante o horário de funcionamento para levantar a sua encomenda. Recomendamos que verifique o horário directamente com a farmácia ou na nossa plataforma.\n\nNão se esqueça de levar um documento de identificação e, se possível, o número da sua encomenda (${orderNumber}).\n\nSe tiver alguma dúvida, por favor contacte directamente a farmácia ou o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
