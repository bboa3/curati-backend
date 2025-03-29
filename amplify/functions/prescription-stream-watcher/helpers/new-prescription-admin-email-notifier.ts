import { env } from '$amplify/env/prescription-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';

const client = new SESv2Client();

export async function newPrescriptionAdminEmailNotifier(
  toAddresses: string[],
  prescriptionNumber: string,
) {
  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const salutation = "Prezado(a) Administrador(a)/Farmacêutico(a),";

  const htmlBody = `
    <html>
    <head><style>body { font-family: sans-serif; } p { margin-bottom: 10px; }</style></head>
    <body>
      <h1>Validação de Nova Receita Necessária</h1>
      <p>${salutation}</p>
      <p>Uma nova prescrição foi submetida e aguarda a sua validação no sistema Cúrati.</p>
      <p><strong>Número da Receita:</strong> ${prescriptionNumber}</p>
      <p><strong>Ação Necessária:</strong> Por favor, acesse a plataforma Cúrati para revisar e validar a prescrição o mais breve possível.</p>
      <p>A sua atenção é crucial para garantir que os pacientes recebam seus medicamentos atempadamente.</p>
      <p>Atenciosamente,</p>
      <p><strong>Equipa Cúrati Saúde</strong></p>
      ${footerHtml}
    </body>
    </html>
  `;

  const textBody = `Validação de Nova Receita Necessária\n\n${salutation}\n\nUma nova prescrição foi submetida e aguarda a sua validação no sistema Cúrati.\n\nNúmero da Receita: ${prescriptionNumber}\n\nAção Necessária: Por favor, acesse a plataforma Cúrati para revisar e validar a prescrição o mais breve possível.\n\nA sua atenção é crucial para garantir que os pacientes recebam seus medicamentos atempadamente.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    ReplyToAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
    Content: {
      Simple: {
        Subject: {
          Data: `Cúrati: Nova Receita (${prescriptionNumber}) Aguarda Validação`,
        },
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
