import { env } from '$amplify/env/delivery-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { DeliveryStatus } from '../../helpers/types/schema';
import { convertDeliveryStatus } from './delivery-status';

interface NotifierInput {
  driverName: string;
  driverEmail: string;
  patientName: string;
  orderNumber: string;
  deliveryNumber: string;
  finalStatus: DeliveryStatus;
  failureReason?: string;
  deliveryDeepLink: string;
}

const client = new SESv2Client();

export async function deliveryFailedDriverEmailNotifier({
  driverName,
  driverEmail,
  patientName,
  orderNumber,
  deliveryNumber,
  finalStatus,
  failureReason,
  deliveryDeepLink
}: NotifierInput) {
  const subject = `Cúrati Go: Atualização Entrega ${deliveryNumber} - ${convertDeliveryStatus(finalStatus)}`;
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
            <h1>Atualização de Tarefa de Entrega</h1>
            <p>Prezado(a) ${driverName},</p>
            <p>Informamos que a tarefa de entrega (Nº <strong>${deliveryNumber}</strong>), referente à encomenda Nº <strong>${orderNumber}</strong> para o(a) paciente ${patientName}, foi atualizada para o estado: <strong>${formattedStatus}</strong>.</p>
            ${failureReason ? `<p><strong>Motivo Registado:</strong> ${failureReason}</p>` : ''}
  
            <p><strong>Estado da Tarefa:</strong> Esta tarefa foi removida da sua lista de entregas ativas no aplicativo Cúrati Driver.</p>
            <p>Nenhuma ação adicional é esperada da sua parte para esta entrega específica, a menos que seja contactado(a) pelo suporte.</p>
  
            <p>Pode rever os detalhes (se necessário) na aplicação:</p>
            <p><a href="${deliveryDeepLink}" class="button button-info">Ver Detalhes na App Driver</a></p>
  
            <p>Se tiver alguma questão, por favor contacte a equipa de suporte de logística.</p>
  
            <p>Atenciosamente,</p>
            <p><strong>Equipa de Logística Cúrati Saúde</strong></p>
            ${footerHtml}
          </div>
        </body>
        </html>
      `;

  const textBody = `Atualização de Tarefa de Entrega\n\nPrezado(a) ${driverName},\n\nInformamos que a tarefa de entrega (Nº ${deliveryNumber}), referente à encomenda Nº ${orderNumber} para ${patientName}, foi atualizada para o estado: ${formattedStatus}.\n\n${failureReason ? `Motivo Registado: ${failureReason}\n` : ''}\nEstado da Tarefa: Removida das suas entregas ativas. Nenhuma ação adicional necessária, salvo indicação do suporte.\n\nVer Detalhes: ${deliveryDeepLink}\n\nQuestões? Contacte o suporte de logística.\n\nAtenciosamente,\nEquipa de Logística Cúrati Saúde${footerText}`;

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
