import { env } from '$amplify/env/appointment-stream-watcher';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { AppointmentParticipantType, AppointmentType } from '../../helpers/types/schema';
import { convertAppointmentType } from './appointment-type';

const client = new SESv2Client();

interface SendInput {
  recipientName: string;
  recipientEmail: string;
  otherPartyName: string;
  recipientType: AppointmentParticipantType
  appointmentNumber: string;
  appointmentDateTime: string;
  duration: number;
  appointmentType: AppointmentType;
  purpose: string;
  appointmentDeepLink: string;
}

export async function confirmedAppointmentEmailNotifier({
  recipientName,
  recipientEmail,
  otherPartyName,
  recipientType,
  appointmentNumber,
  appointmentDateTime,
  duration,
  appointmentType,
  purpose,
  appointmentDeepLink,
}: SendInput) {
  const currentYear = new Date().getFullYear();
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const baseHtmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; } h1 { font-size: 1.6em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #E6F7EE; } h1.success { color: #179E57; } h1.failure { color: #dc3545; } h2 { color: #179E57; font-size: 1.3em; margin-top: 25px; margin-bottom: 10px; } p { margin-bottom: 14px; } strong { font-weight: 600; color: #0D5E38; } ul { margin: 15px 0; padding-left: 20px; list-style: none; } li { margin-bottom: 8px; padding-left: 15px; position: relative; } li::before { content: '•'; color: #1BBA66; font-weight: bold; display: inline-block; position: absolute; left: 0; top: 0; } li strong { display: inline-block; min-width: 110px; color: #474954; } a.button { padding: 12px 25px; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; } a.button-success { background-color: #1BBA66; } a.button-success:hover { background-color: #179E57; } a.button-info { background-color: #6c757d; } a.button-info:hover { background-color: #5a6268; } a.button-reschedule { background-color: #ffc107; color: #2F303A !important; } a.button-reschedule:hover { background-color: #e0a800; } .footer { font-size: 0.85em; color: #777B8A; margin-top: 30px; border-top: 1px solid #E2E3E7; padding-top: 20px; text-align: center; }</style></head>`;

  const isRecipientPatient = recipientType === AppointmentParticipantType.PATIENT;
  const subject = `Cúrati: Agendamento ${appointmentNumber} CONFIRMADO!`;
  const htmlBody = `
          ${baseHtmlHead}
          <body>
            <div class="container">
              <h1 class="success">Agendamento Confirmado!</h1>
              <p>Prezado(a) ${recipientName},</p>
              <p>Confirmamos com sucesso o seu agendamento ${isRecipientPatient ? `com ${otherPartyName}` : `com o(a) paciente ${otherPartyName}`} para "${purpose}".</p>
              <h2>Detalhes do Agendamento:</h2>
              <ul>
                <li><strong>Propósito:</strong> ${purpose}</li>
                <li><strong>${isRecipientPatient ? 'Profissional:' : 'Paciente:'}</strong> ${otherPartyName}</li>
                <li><strong>Data e Hora:</strong> ${formattedDateTime}</li>
                <li><strong>Duração:</strong> ${duration} minutos</li>
                <li><strong>Tipo:</strong> ${formattedType}</li>
                <li><strong>Referência:</strong> ${appointmentNumber}</li>
              </ul>
              ${isRecipientPatient && formattedType === 'Presencial' ? '<p><strong>Localização:</strong> Por favor, dirija-se a [Endereço Clínica/Hospital - A BUSCAR] no horário marcado.</p>' : ''}
              ${!isRecipientPatient && formattedType === 'Presencial' ? '<p><strong>Instrução:</strong> Por favor, esteja preparado(a) para receber o paciente no local agendado.</p>' : ''}
              ${formattedType !== 'Presencial' ? '<p>Receberá um lembrete e instruções adicionais (se aplicável) mais perto da data.</p>' : ''}
              <p>Pode ver os detalhes completos na aplicação:</p>
              <p><a href="${appointmentDeepLink}" class="button button-success">Ver Detalhes do Agendamento</a></p>
              <p>Atenciosamente,</p>
              <p><strong>Equipa Cúrati Saúde</strong></p>
              ${footerHtml}
            </div>
          </body>
          </html>
        `;
  const textBody = `Agendamento Confirmado!\n\nPrezado(a) ${recipientName},\n\nConfirmamos com sucesso o seu agendamento ${isRecipientPatient ? `com ${otherPartyName}` : `com o(a) paciente ${otherPartyName}`} para "${purpose}".\n\nDetalhes:\n- Propósito: ${purpose}\n- ${isRecipientPatient ? 'Profissional:' : 'Paciente:'} ${otherPartyName}\n- Data e Hora: ${formattedDateTime}\n- Duração: ${duration} min\n- Tipo: ${formattedType}\n- Referência: ${appointmentNumber}\n\n${isRecipientPatient && formattedType === 'Presencial' ? 'Localização: Dirija-se a [Endereço Clínica/Hospital - A BUSCAR].\n' : ''}${!isRecipientPatient && formattedType === 'Presencial' ? 'Instrução: Esteja preparado(a) para receber o paciente.\n' : ''}${formattedType !== 'Presencial' ? 'Receberá um lembrete antes.\n' : ''}\nVer Detalhes: ${appointmentDeepLink}\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
