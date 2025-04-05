import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { DeliveryStatus } from '../../helpers/types/schema';
import { convertDeliveryStatus } from './delivery-status';

interface NotifierInput {
  pharmacyName: string;
  pharmacyEmail: string;
  patientName: string;
  orderNumber: string;
  deliveryNumber: string;
  driverName?: string;
  finalStatus: DeliveryStatus;
  failureReason?: string;
}

const client = new SESv2Client();

export async function deliveryFailedPharmacyEmailNotifier({
  pharmacyName,
  pharmacyEmail,
  patientName,
  orderNumber,
  deliveryNumber,
  driverName,
  finalStatus,
  failureReason,
}: NotifierInput) {
  const subject = `Cúrati Biz: ATENÇÃO - Entrega ${deliveryNumber} (${orderNumber}) ${convertDeliveryStatus(finalStatus)}`;
  const currentYear = new Date().getFullYear();
  const formattedStatus = convertDeliveryStatus(finalStatus);

  const footerHtml = `
      <div class="footer">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; } h1 { color: #dc3545; font-size: 1.6em; margin-bottom: 15px;} p { margin-bottom: 14px; } strong { font-weight: 600; color: #0D5E38; } .highlight { background-color: #E6F7EE; /* Light green highlight */ padding: 15px 20px; border-radius: 5px; border-left: 5px solid #1BBA66; /* Primary green border */ margin: 25px 0; color: #0D5E38; } a.button { padding: 12px 25px; background-color: #1BBA66; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; } a.button:hover { background-color: #179E57; } .footer { font-size: 0.85em; color: #777B8A; margin-top: 30px; border-top: 1px solid #E2E3E7; padding-top: 20px; text-align: center; }</style></head>`;

  const htmlBody = `
      ${htmlHead}
      <body>
        <div class="container">
          <h1>Alerta: Entrega de Encomenda ${formattedStatus}</h1>
          <p>Prezada Equipa da Farmácia ${pharmacyName},</p>
          <p>Atenção: A entrega (Nº <strong>${deliveryNumber}</strong>) da encomenda Nº <strong>${orderNumber}</strong> para o(a) paciente <strong>${patientName}</strong> não foi concluída.</p>
          <p>O estado final da entrega é: <strong>${formattedStatus}</strong>.</p>
          ${failureReason ? `<p><strong>Motivo Registado:</strong> ${failureReason}</p>` : ''}
          ${driverName ? `<p><strong>Motorista Designado (se aplicável):</strong> ${driverName}</p>` : ''}

          <div class="highlight">
            <p><strong>Ação Potencialmente Necessária:</strong> Por favor, revejam esta encomenda no portal Cúrati Business. Dependendo do motivo da falha/cancelamento, podem ser necessárias ações como:</p>
            <ul>
              <li>Verificar e preparar para uma nova tentativa de entrega (após contacto do suporte/paciente).</li>
              <li>Retornar os medicamentos ao stock disponível.</li>
              <li>Coordenar com a equipa de suporte Cúrati.</li>
            </ul>
          </div>

          <p>Acedam ao sistema Cúrati RX para verificar os detalhes completos da encomenda e o seu estado atual.</p>

          <p>Por favor, contactem o suporte Cúrati se necessitarem de assistência adicional.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Alerta: Entrega de Encomenda ${formattedStatus}\n\nPrezada Equipa da Farmácia ${pharmacyName},\n\nAtenção: A entrega (Nº ${deliveryNumber}) da encomenda Nº ${orderNumber} para o(a) paciente ${patientName} não foi concluída.\nO estado final da entrega é: ${formattedStatus}.\n${failureReason ? `Motivo Registado: ${failureReason}\n` : ''}${driverName ? `Motorista Designado (se aplicável): ${driverName}\n` : ''}\n\nAção Potencialmente Necessária: Por favor, revejam esta encomenda no portal Cúrati Business. Conforme o motivo, pode ser necessário retornar produtos ao stock ou coordenar próximos passos com suporte/paciente.\n\nContactem o suporte Cúrati se necessário.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
