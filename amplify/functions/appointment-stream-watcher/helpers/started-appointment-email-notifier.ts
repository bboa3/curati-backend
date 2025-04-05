import { env } from '$amplify/env/appointment-stream-watcher';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';
import { AppointmentParticipantType, AppointmentType } from '../../helpers/types/schema';

const client = new SESv2Client();

interface SendInput {
  recipientName: string;
  recipientEmail: string;
  starterName: string;
  starterType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentType: AppointmentType;
  purpose: string;
  appointmentJoinLink?: string;
}

export async function startedAppointmentEmailNotifier({
  recipientName,
  recipientEmail,
  starterName,
  starterType,
  appointmentNumber,
  appointmentType,
  purpose,
  appointmentJoinLink,
}: SendInput) {
  const subject = `Cúrati: Consulta Iniciada! Agendamento ${appointmentNumber}`;
  const currentYear = new Date().getFullYear();

  const starterText = starterType === AppointmentParticipantType.PATIENT ? `O(A) paciente ${starterName}` : `O(A) ${starterName}`;
  const sessionTypeText = appointmentType === AppointmentType.IN_PERSON ? 'consulta presencial' : `sessão de ${purpose}`;

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const baseHtmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; } h1 { color: #179E57; font-size: 1.6em; margin-bottom: 15px;} p { margin-bottom: 14px; } strong { font-weight: 600; color: #0D5E38; } .highlight { background-color: #E6F7EE; padding: 15px 20px; border-radius: 5px; border-left: 5px solid #1BBA66; margin: 25px 0; color: #0D5E38; } a.button { padding: 12px 25px; background-color: #1BBA66; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; } a.button:hover { background-color: #179E57; }</style></head>`;

  let actionHtml = '';
  let actionText = '';
  if (appointmentType === AppointmentType.IN_PERSON) {
    actionHtml = `<p><strong>Ação:</strong> Se ainda não estiver no local, por favor dirija-se à área de consulta designada.</p>`;
    actionText = `Ação: Se ainda não estiver no local, por favor dirija-se à área de consulta designada.`;
  } else if (appointmentType === AppointmentType.VIDEO || appointmentType === AppointmentType.AUDIO || appointmentType === AppointmentType.TEXT) {
    actionHtml = `
          <div class="highlight">
            <p><strong>Ação Necessária:</strong> A sua participação é aguardada. Por favor, clique abaixo para entrar na sessão agora.</p>
          </div>
          <p><a href="${appointmentJoinLink}" class="button">Entrar na Consulta Agora</a></p>
        `;
    actionText = `Ação Necessária: A sua participação é aguardada. Entre na sessão agora: ${appointmentJoinLink}`;
  }

  const htmlBody = `
      ${baseHtmlHead}
      <body>
        <div class="container">
          <h1>Consulta Iniciada!</h1>
          <p>Prezado(a) ${recipientName},</p>
          <p>Informamos que ${starterText} já iniciou a ${sessionTypeText} (Referência: <strong>${appointmentNumber}</strong>).</p>

          ${actionHtml}

          <p>Se encontrar dificuldades técnicas ${appointmentType !== AppointmentType.IN_PERSON ? 'para entrar na sessão ' : ''}ou tiver alguma questão, por favor contacte o nosso suporte.</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Consulta Iniciada!\n\nPrezado(a) ${recipientName},\n\nInformamos que ${starterText} já iniciou a ${sessionTypeText} (Referência: ${appointmentNumber}).\n\n${actionText}\n\nSe encontrar dificuldades técnicas ${appointmentType !== AppointmentType.IN_PERSON ? 'para entrar na sessão ' : ''}ou tiver alguma questão, por favor contacte o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;


  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: [recipientEmail],
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
