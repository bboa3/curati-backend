import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';

interface NotifierInput {
  pharmacyName: string;
  pharmacyEmail: string;
  patientName: string;
  orderNumber: string;
  pickupTimestamp: string;
}

const client = new SESv2Client();

export async function deliveryPickedUpPharmacyEmailNotifier({
  pharmacyName,
  pharmacyEmail,
  patientName,
  orderNumber,
  pickupTimestamp,
}: NotifierInput) {
  const subject = `Cúrati Biz: Encomenda ${orderNumber} Retirada Pelo Paciente`;
  const currentYear = new Date().getFullYear();
  const formattedPickupTimestamp = formatDateTimeNumeric(pickupTimestamp);


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
          <h1>Encomenda Retirada Pelo Paciente</h1>
          <p>Prezada Equipa da Farmácia ${pharmacyName},</p>
          <p>Para sua informação, a encomenda de medicamentos (Nº <strong>${orderNumber}</strong>) foi retirada com sucesso das vossas instalações pelo(a) paciente <strong>${patientName}</strong>.</p>

          <h2>Detalhes da Retirada:</h2>
          <ul>
              <li><strong>Data/Hora da Retirada:</strong> ${formattedPickupTimestamp}</li>
              <li><strong>Paciente:</strong> ${patientName}</li>
              <li><strong>Referência da Encomenda:</strong> ${orderNumber}</li>
          </ul>

          <p>Esta encomenda está agora marcada como concluída no sistema Cúrati. Nenhuma ação adicional é necessária da vossa parte relativamente a esta encomenda.</p>
          <p>Podem consultar o histórico de encomendas concluídas no sistema Cúrati RX.</p>

          <p>Agradecemos a vossa colaboração neste processo.</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Encomenda Retirada Pelo Paciente\n\nPrezada Equipa da Farmácia ${pharmacyName},\n\nInformamos que a encomenda (Nº ${orderNumber}) foi retirada com sucesso das vossas instalações pelo(a) paciente ${patientName} em ${formattedPickupTimestamp}.\n\nDetalhes:\n- Data/Hora da Retirada: ${formattedPickupTimestamp}\n- Paciente: ${patientName}\n- Referência da Encomenda: ${orderNumber}\n\nEsta encomenda está agora marcada como concluída. Nenhuma ação adicional é necessária.\n\nConsultem o histórico no sistema Cúrati RX.\n\nAgradecemos a vossa colaboração!\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
