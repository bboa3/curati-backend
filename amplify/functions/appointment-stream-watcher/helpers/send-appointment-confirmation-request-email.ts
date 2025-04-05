import { env } from '$amplify/env/appointment-stream-watcher';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';
import { formatDateTimeNumeric } from '../../helpers/date/formatter';
import { AppointmentParticipantType, AppointmentType } from '../../helpers/types/schema';
import { convertAppointmentType } from './appointment-type';

const client = new SESv2Client();

interface SendInput {
  recipientName: string;
  recipientEmail: string;
  requesterName: string;
  requesterType: AppointmentParticipantType
  appointmentNumber: string;
  appointmentDateTime: string;
  duration: number;
  appointmentType: AppointmentType;
  purpose: string;
  appointmentDeepLink: string;
}

export async function sendAppointmentConfirmationRequestEmail({
  recipientName,
  recipientEmail,
  requesterName,
  requesterType,
  appointmentNumber,
  appointmentDateTime,
  duration,
  appointmentType,
  purpose,
  appointmentDeepLink,
}: SendInput) {
  const subject = `Cúrati: Confirmação Necessária - Agendamento ${appointmentNumber}`;
  const currentYear = new Date().getFullYear();
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedType = convertAppointmentType(appointmentType);

  const requesterText = requesterType === AppointmentParticipantType.PATIENT ? `o(a) paciente ${requesterName}` : `o(a) ${requesterName}`;
  const introText = requesterType === AppointmentParticipantType.PATIENT
    ? `Um novo pedido de agendamento foi solicitado por ${requesterText} e aguarda a sua confirmação.`
    : `${requesterText} propôs um novo agendamento para si através da plataforma Cúrati.`;

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlBody = `
      <html>
      <head>
        <style>
          /* Base Styles */
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #2F303A; /* --color-black-800 */
            line-height: 1.6;
            background-color: #ffffff; /* Assuming white background */
            margin: 0;
            padding: 0;
           }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 25px;
            border: 1px solid #E2E3E7; /* --color-black-100 */
            border-radius: 8px;
            background-color: #ffffff;
          }
          h1 {
            color: #127E47; /* --color-primary-700 */
            font-size: 1.6em;
            margin-bottom: 20px;
            border-bottom: 2px solid #E6F7EE; /* --color-primary-50 */
            padding-bottom: 10px;
          }
          h2 {
            color: #179E57; /* --color-primary-600 */
            font-size: 1.3em;
            margin-top: 25px;
            margin-bottom: 10px;
          }
          p { margin-bottom: 14px; }
          strong {
            font-weight: 600;
            color: #0D5E38; /* --color-primary-800 */
          }
          ul {
             margin: 15px 0;
             padding-left: 20px;
             list-style: none; /* Remove default bullets */
          }
          li {
            margin-bottom: 8px;
            padding-left: 15px; /* Space for custom bullet */
            position: relative;
           }
           li::before { /* Custom bullet */
             content: '•';
             color: #1BBA66; /* --color-primary-500 */
             font-weight: bold;
             display: inline-block;
             position: absolute;
             left: 0;
             top: 0;
           }
          li strong {
            display: inline-block;
            min-width: 100px; /* Align labels */
            color: #474954; /* --color-black-700 */
           }
           /* Highlight Box */
          .highlight {
            background-color: #E6F7EE; /* --color-primary-50 */
            padding: 15px 20px;
            border-radius: 5px;
            border-left: 5px solid #1BBA66; /* --color-primary-500 */
            margin: 25px 0;
            color: #0D5E38; /* --color-primary-800 */
          }
          .highlight p { margin-bottom: 5px; }
          /* Button Styles */
          a.button {
            padding: 12px 25px;
            background-color: #1BBA66; /* --color-primary-500 */
            color: #ffffff !important; /* White text */
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 15px;
            font-weight: 500;
            border: none;
            transition: background-color 0.2s ease;
          }
          a.button:hover {
             background-color: #179E57; /* --color-primary-600 */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Confirmação de Agendamento Necessária</h1>
          <p>Prezado(a) ${recipientName},</p>
          <p>${introText}</p>

          <h2>Detalhes do Agendamento Proposto:</h2>
          <ul>
            <li><strong>Propósito:</strong> ${purpose}</li>
            <li><strong>${requesterType === AppointmentParticipantType.PATIENT ? 'Paciente:' : 'Profissional:'}</strong> ${requesterName}</li>
            <li><strong>Data e Hora:</strong> ${formattedDateTime}</li>
            <li><strong>Duração:</strong> ${duration} minutos</li>
            <li><strong>Tipo:</strong> ${formattedType}</li>
            <li><strong>Referência:</strong> ${appointmentNumber}</li>
          </ul>

          <div class="highlight">
             <p><strong>Ação Necessária:</strong> Por favor, reveja os detalhes e confirme a sua disponibilidade ${requesterType === AppointmentParticipantType.PATIENT ? 'para este agendamento' : 'o mais breve possível'} através da aplicação Cúrati.</p>
          </div>

          <p>A sua confirmação atempada é importante para garantir a reserva do horário.</p>
          <p><a href="${appointmentDeepLink}" class="button">Rever e Confirmar Agendamento</a></p>

          <p>Se esta data/hora não for conveniente ou se tiver alguma questão, por favor utilize a aplicação para ${requesterType === AppointmentParticipantType.PATIENT ? 'propor um reagendamento ou contactar o suporte' : 'contactar o paciente ou o suporte'}.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Confirmação de Agendamento Necessária\n\nPrezado(a) ${recipientName},\n\n${introText}\n\nDetalhes do Agendamento Proposto:\n- Propósito: ${purpose}\n- ${requesterType === AppointmentParticipantType.PATIENT ? 'Paciente:' : 'Profissional:'} ${requesterName}\n- Data e Hora: ${formattedDateTime}\n- Duração: ${duration} minutos\n- Tipo: ${formattedType}\n- Referência: ${appointmentNumber}\n\nAção Necessária: Por favor, reveja os detalhes e confirme a sua disponibilidade ${requesterType === AppointmentParticipantType.PATIENT ? 'para este agendamento' : 'o mais breve possível'} através da aplicação Cúrati.\n\nA sua confirmação atempada é importante para garantir a reserva do horário.\n\nRever e Confirmar: ${appointmentDeepLink}\n\nSe esta data/hora não for conveniente ou se tiver alguma questão, por favor utilize a aplicação para ${requesterType === AppointmentParticipantType.PATIENT ? 'propor um reagendamento ou contactar o suporte' : 'contactar o paciente ou o suporte'}.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
