import { env } from '$amplify/env/support-contact-email';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';

const client = new SESv2Client();

interface SendInput {
  toAddresses: string[];
  name: string;
  email: string;
  phone?: string;
  userType: string;
  reason: string;
  subject?: string;
  message: string;
}

export async function sendEmailToSupport({
  toAddresses,
  name,
  email,
  phone,
  userType,
  reason,
  subject: emailSubject,
  message
}: SendInput) {
  const currentYear = new Date().getFullYear();

  const finalSubject = emailSubject || `Cúrati Suporte: Novo Pedido de "${reason}"`;

  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlStyles = `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #2F303A; /* --color-black-800 */
        line-height: 1.6;
        background-color: #f4f4f4; /* Light gray background for the email client */
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 25px;
        border: 1px solid #E2E3E7; /* --color-black-100 */
        border-radius: 8px;
        background-color: #ffffff; /* White background for content */
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
         margin: 10px 0 15px 0; /* Adjusted margin */
         padding-left: 0; /* Will use custom list styling approach */
         list-style: none;
      }
      li {
        padding: 6px 0; /* Spacing for list items */
        border-bottom: 1px dotted #E2E3E7; /* Light separator for list items */
      }
      li:last-child {
        border-bottom: none; /* No border for the last item */
      }
      li strong { /* Label part of the list item */
        display: inline-block;
        min-width: 150px; /* Adjust as needed for alignment */
        color: #474954; /* --color-black-700 */
        margin-right: 8px;
      }
      .message-box {
        background-color: #F5F6F9; /* --color-black-50 */
        padding: 15px 20px;
        border-radius: 5px;
        border: 1px solid #E2E3E7; /* --color-black-100 */
        margin: 20px 0;
        color: #2F303A; /* --color-black-800 */
        white-space: pre-wrap; /* Preserve line breaks and spaces */
        word-wrap: break-word; /* Break long words */
      }
      a {
        color: #1BBA66; /* --color-primary-500 */
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  `;

  const htmlBody = `
    <html>
    <head>
      ${htmlStyles}
    </head>
    <body>
      <div class="container">
        <h1>Novo Pedido de Suporte Cúrati</h1>
        <p>Recebeu uma nova mensagem através do formulário de contacto do website/app Cúrati.</p>

        <h2>Detalhes do Remetente</h2>
        <ul>
          <li><strong>Nome:</strong> ${name}</li>
          <li><strong>Email (para resposta):</strong> <a href="mailto:${email}">${email}</a></li>
          ${phone ? `<li><strong>Telefone:</strong> ${phone}</li>` : ''}
          <li><strong>Tipo de Utilizador:</strong> ${userType || 'Não especificado'}</li>
          <li><strong>Motivo do Contacto:</strong> ${reason}</li>
          ${emailSubject && emailSubject !== `Cúrati Suporte: Novo Pedido de "${reason}"` ? `<li><strong>Assunto Fornecido:</strong> ${emailSubject}</li>` : ''}
        </ul>

        <h2>Mensagem do Utilizador</h2>
        <div class="message-box">
          ${message}
        </div>

        <p style="margin-top: 25px; font-weight: bold;">
          Por favor, responda diretamente ao utilizador através do email: <a href="mailto:${email}">${email}</a>.
        </p>
        ${footerHtml}
      </div>
    </body>
    </html>
  `;

  const textBody = `
    Novo Pedido de Suporte Cúrati
    ------------------------------------

    Recebeu uma nova mensagem através do formulário de contacto do website/app Cúrati.

    Detalhes do Remetente:
    - Nome: ${name}
    - Email (para resposta): ${email}
    ${phone ? `- Telefone: ${phone}\n` : ''}- Tipo de Utilizador: ${userType || 'Não especificado'}
    - Motivo do Contacto: ${reason}
    ${emailSubject && emailSubject !== `Cúrati Suporte: Novo Pedido de "${reason}"` ? `- Assunto Fornecido: ${emailSubject}\n` : ''}

    Mensagem do Utilizador:
    ------------------------------------
    ${message}
    ------------------------------------

    Ação Sugerida:
    Por favor, responda diretamente ao utilizador através do email: ${email}.
    ${footerText}
  `;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    ReplyToAddresses: [email],
    Content: {
      Simple: {
        Subject: { Data: finalSubject },
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
