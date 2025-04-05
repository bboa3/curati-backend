import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';

interface NotifierInput {
  pharmacyName: string;
  pharmacyEmail: string;
  patientName: string;
  orderNumber: string;
  deliveryNumber: string;
  driverName: string;
  deliveredAt: string;
}

const client = new SESv2Client();

export async function deliveryDeliveredPharmacyEmailNotifier({
  pharmacyName,
  pharmacyEmail,
  patientName,
  orderNumber,
  deliveryNumber,
  driverName,
  deliveredAt,
}: NotifierInput) {
  const subject = `Cúrati Biz: Encomenda ${orderNumber} Entregue ao Cliente`;
  const currentYear = new Date().getFullYear();
  const formattedDeliveredAt = formatDateTimeNumeric(deliveredAt);

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
          <h1>Encomenda Entregue</h1>
          <p>Prezada Equipa da Farmácia ${pharmacyName},</p>
          <p>Informamos que a encomenda de medicamentos (Nº <strong>${orderNumber}</strong>), processada por vós, foi entregue com sucesso ao(à) paciente <strong>${patientName}</strong>.</p>

          <h2>Detalhes da Conclusão:</h2>
          <ul>
              <li><strong>Referência da Entrega:</strong> ${deliveryNumber}</li>
              <li><strong>Entregue por (Motorista):</strong> ${driverName}</li>
              <li><strong>Data/Hora da Entrega:</strong> ${formattedDeliveredAt}</li>
          </ul>

          <p>O estado desta encomenda foi atualizado no sistema como 'Entregue'. Nenhuma ação adicional é necessária da vossa parte para esta encomenda específica.</p>
          <p>Podem consultar o estado de todas as vossas encomendas no sistema Cúrati RX:</p>

          <p>Agradecemos a vossa colaboração e eficiência no processamento desta encomenda.</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Encomenda Entregue\n\nPrezada Equipa da Farmácia ${pharmacyName},\n\nInformamos que a encomenda de medicamentos (Nº ${orderNumber}), processada por vós, foi entregue com sucesso ao(à) paciente ${patientName}.\n\nDetalhes da Conclusão:\n- Referência da Entrega: ${deliveryNumber}\n- Entregue por (Motorista): ${driverName}\n- Data/Hora da Entrega: ${formattedDeliveredAt}\n\nO estado desta encomenda foi atualizado como 'Entregue'.\n\nConsultem as vossas encomendas no sistema Cúrati RX\n\nAgradecemos a vossa colaboração!\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: [pharmacyEmail],
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
