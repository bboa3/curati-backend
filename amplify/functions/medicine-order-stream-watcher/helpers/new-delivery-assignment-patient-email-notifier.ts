import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { Address, DeliveryType } from '../../helpers/types/schema';

interface NotifierInput {
  patientEmail: string;
  pharmacyAddress: Address;
  pharmacyName: string;
  deliveryType: DeliveryType;
  orderNumber: string;
  patientName: string;
  deliveryDeepLink: string;
}

const client = new SESv2Client();

export async function newDeliveryAssignmentPatientEmailNotifier({ patientEmail, pharmacyAddress, pharmacyName, orderNumber, deliveryType, patientName, deliveryDeepLink }: NotifierInput) {
  let subject: string;
  let htmlBody: string;
  let textBody: string;

  const currentYear = new Date().getFullYear();

  const footerHtml = `
      <div style="font-size: 0.8em; color: #777; margin-top: 25px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const baseHtmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; } h1 { color: #0056b3; font-size: 1.5em; } p { margin-bottom: 12px; } strong { color: #333; } a.button { padding: 12px 20px; background-color: #28a745; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; } .address { background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px; } .footer { font-size: 0.8em; color: #777; margin-top: 25px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; }</style></head>`;

  if (deliveryType === DeliveryType.PICKUP) {
    subject = `Cúrati: Sua Encomenda (${orderNumber}) Está Pronta para Retirada!`;
    const address = `${pharmacyAddress.addressLine1}, ${pharmacyAddress.neighborhoodOrDistrict}, ${pharmacyAddress.city}`

    htmlBody = `
          ${baseHtmlHead}
          <body>
            <div class="container">
              <h1>Encomenda Pronta para Retirada</h1>
              <p>Prezado(a) ${patientName},</p>
              <p>Boas notícias! A sua encomenda de medicamentos (Nº <strong>${orderNumber}</strong>) está pronta e aguarda a sua retirada.</p>
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
    textBody = `Encomenda Pronta para Retirada\n\nPrezado(a) ${patientName},\n\nBoas notícias! A sua encomenda de medicamentos (Nº ${orderNumber}) está pronta e aguarda a sua retirada.\n\nDetalhes da Farmácia:\n- Farmácia: ${pharmacyName}\n- Endereço: ${pharmacyAddress}\n\nInstruções: Por favor, dirija-se à farmácia durante o horário de funcionamento para levantar a sua encomenda. Recomendamos que verifique o horário directamente com a farmácia ou na nossa plataforma.\n\nNão se esqueça de levar um documento de identificação e, se possível, o número da sua encomenda (${orderNumber}).\n\nSe tiver alguma dúvida, por favor contacte directamente a farmácia ou o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  } else {
    subject = `Cúrati: Sua Encomenda (${orderNumber}) Está Pronta para Entrega!`;

    htmlBody = `
          ${baseHtmlHead}
          <body>
            <div class="container">
              <h1>Encomenda Pronta para Entrega</h1>
              <p>Prezado(a) ${patientName},</p>
              <p>Ótima notícia! A sua encomenda de medicamentos (Nº <strong>${orderNumber}</strong>) foi preparada com sucesso e está pronta para ser despachada para entrega no seu endereço.</p>
              <p><strong>Próximos Passos:</strong> Em breve, um motorista será atribuído à sua entrega. Receberá notificações adicionais assim que a encomenda estiver em trânsito.</p>
              <p>Pode acompanhar o estado atualizado da sua entrega directamente na aplicação Cúrati:</p>
              <p><a href="${deliveryDeepLink}" class="button">Acompanhar Entrega na App</a></p>
              <p>Se o link acima não funcionar diretamente, por favor abra a aplicação Cúrati e navegue para "Meus Pedidos".</p>
              <p>Se tiver alguma dúvida, por favor contacte o nosso suporte.</p>
              <p>Atenciosamente,</p>
              <p><strong>Equipa Cúrati Saúde</strong></p>
              ${footerHtml}
            </div>
          </body>
          </html>
        `;
    textBody = `Encomenda Pronta para Entrega\n\nPrezado(a) ${patientName},\n\nÓtima notícia! A sua encomenda de medicamentos (Nº ${orderNumber}) foi preparada com sucesso e está pronta para ser despachada para entrega no seu endereço.\n\nPróximos Passos: Em breve, um motorista será atribuído à sua entrega. Receberá notificações adicionais assim que a encomenda estiver em trânsito.\n\nPode acompanhar o estado atualizado da sua entrega directamente na aplicação Cúrati:\n${deliveryDeepLink}\n(Nota: Se o link não abrir a aplicação, por favor navegue manualmente para "Meus Pedidos" dentro da app Cúrati).\n\nSe tiver alguma dúvida, por favor contacte o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;
  }

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
