import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { Address } from '../../helpers/types/schema';

interface NotifierInput {
  driverName: string;
  driverEmail: string;
  pharmacyName: string;
  patientName: string;
  orderNumber: string;
  deliveryNumber: string;
  deliveredAt: string;
  deliveryAddress: Address;
  driverStatsDeepLink: string;
}

const client = new SESv2Client();

export async function deliveryDeliveredDriverEmailNotifier({
  driverName,
  driverEmail,
  pharmacyName,
  patientName,
  orderNumber,
  deliveryNumber,
  deliveredAt,
  deliveryAddress,
  driverStatsDeepLink
}: NotifierInput) {
  const subject = `Cúrati Go: Entrega ${deliveryNumber} Concluída`;
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
          <h1>Entrega Concluída com Sucesso!</h1>
          <p>Prezado(a) ${driverName},</p>
          <p>Bom trabalho! Confirmamos que completou com sucesso a entrega (Nº <strong>${deliveryNumber}</strong>) associada à encomenda Nº <strong>${orderNumber}</strong>.</p>

          <h2>Resumo da Entrega:</h2>
          <ul>
            <li><strong>Paciente:</strong> ${patientName}</li>
            <li><strong>Farmácia (Recolha):</strong> ${pharmacyName}</li>
            <li><strong>Endereço (Entrega):</strong> ${formattedAddress}</li>
            <li><strong>Concluída em:</strong> ${formattedDeliveredAt}</li>
          </ul>

          <p>A sua tarefa foi marcada como concluída no sistema. Pode consultar o resumo das suas entregas e ganhos na aplicação Cúrati Driver.</p>
          <p><a href="${driverStatsDeepLink}" class="button button-info">Ver Minhas Entregas</a></p>

          <p>Agradecemos o seu profissionalismo e dedicação!</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa de Logística Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Entrega Concluída com Sucesso!\n\nPrezado(a) ${driverName},\n\nBom trabalho! Confirmamos que completou com sucesso a entrega (Nº ${deliveryNumber}) associada à encomenda Nº ${orderNumber}.\n\nResumo:\n- Paciente: ${patientName}\n- Farmácia (Recolha): ${pharmacyName}\n- Endereço (Entrega): ${formattedAddress}\n- Concluída em: ${formattedDeliveredAt}\n\nA sua tarefa foi marcada como concluída. Consulte as suas entregas na app Cúrati Driver:\n${driverStatsDeepLink}\n\nObrigado pelo seu trabalho!\n\nAtenciosamente,\nEquipa de Logística Cúrati Saúde${footerText}`;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: [driverEmail],
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
