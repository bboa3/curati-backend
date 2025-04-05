import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { DeliveryStatus } from '../../helpers/types/schema';
import { convertDeliveryStatus } from './delivery-status';

const supportEmail = env.VERIFIED_SES_SUPPORT_EMAIL
const supportPhone = env.SUPPORT_PHONE

interface NotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  deliveryNumber: string;
  finalStatus: DeliveryStatus;
  failureReason?: string;
  orderDeepLink: string;
}

const client = new SESv2Client();

export async function deliveryFailedPatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  deliveryNumber,
  finalStatus,
  failureReason,
  orderDeepLink
}: NotifierInput) {
  const subject = `Cúrati: Problema na Entrega da Encomenda ${orderNumber}`;
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
          <h1>Problema com a Entrega</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Lamentamos profundamente informar que ocorreu um problema com a entrega (Nº <strong>${deliveryNumber}</strong>) da sua recente encomenda Cúrati (Nº <strong>${orderNumber}</strong>).</p>
          <p>O estado atual desta entrega é: <strong>${formattedStatus}</strong>.</p>
          ${failureReason ? `<p><strong>Motivo Informado:</strong> ${failureReason}</p>` : '<p>Não foi possível concluir a entrega conforme planeado.</p>'}

          <div class="highlight">
            <p><strong>O que acontece agora?</strong> Como resultado, a sua encomenda não foi entregue.</p>
            <p><strong>Ação Recomendada:</strong> Por favor, contacte a nossa equipa de suporte o mais breve possível para que possamos entender o ocorrido e ajudar a encontrar a melhor solução para si (ex: reagendar a entrega, verificar detalhes, processar um reembolso, se aplicável).</p>
          </div>

          <p>Pode contactar o suporte através de:</p>
          <ul>
            <li>Email: ${supportEmail}</li>
            <li>Telefone: ${supportPhone}</li>
          </ul>

          <p>Pode também verificar o estado atual da sua encomenda na aplicação:</p>
          <p><a href="${orderDeepLink}" class="button button-action">Ver Estado da Encomenda</a></p>

          <p>Pedimos sinceras desculpas por qualquer inconveniente que esta situação possa ter causado.</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Problema com a Entrega\n\nPrezado(a) ${patientName},\n\nLamentamos informar que ocorreu um problema com a entrega (Nº ${deliveryNumber}) da sua encomenda Cúrati (Nº ${orderNumber}).\nO estado atual desta entrega é: ${formattedStatus}.\n${failureReason ? `Motivo Informado: ${failureReason}\n` : 'Não foi possível concluir a entrega.\n'}\nO que acontece agora? A sua encomenda não foi entregue.\n\nAção Recomendada: Por favor, contacte a nossa equipa de suporte o mais breve possível para resolver a situação (reagendar, reembolso, etc.).\n\n- Email Suporte: ${supportEmail}\n- Telefone Suporte: ${supportPhone}\n\nPode verificar o estado da encomenda na app: ${orderDeepLink}\n\nPedimos desculpas pelo inconveniente.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
