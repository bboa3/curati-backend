import { env } from '$amplify/env/prescription-stream-watcher';
import { SendEmailCommand, SendEmailCommandInput, SESv2Client } from '@aws-sdk/client-sesv2';
import { PrescriptionStatus } from '../../helpers/types/schema';
import { convertPrescriptionStatus } from './prescription-status';

const client = new SESv2Client();

const supportPhone = env.SUPPORT_PHONE;
const supportEmail = env.VERIFIED_SES_SUPPORT_EMAIL;

interface SendInput {
  patientName: string;
  prescriptionStatus: PrescriptionStatus;
  toAddresses: string[];
  prescriptionNumber: string;
  prescriptionDeepLink: string;
}

export async function validatedPrescriptionPatientEmailNotifier({
  patientName,
  prescriptionStatus,
  toAddresses,
  prescriptionNumber,
  prescriptionDeepLink
}: SendInput) {

  let subject: string;
  let htmlBody: string;
  let textBody: string;

  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  if (prescriptionStatus === PrescriptionStatus.ACTIVE) {
    subject = `Cúrati: Sua receita (${prescriptionNumber}) foi APROVADA!`;
    htmlBody = `
          <html>
          <head><style>body { font-family: sans-serif; } p { margin-bottom: 10px; }</style></head>
          <body>
            <h1>Sua Receita Foi Validada com Sucesso!</h1>
            <p>Prezado(a) ${patientName},</p>
            <p>Temos boas notícias! A sua receita médica (Número: <strong>${prescriptionNumber}</strong>) foi validada com sucesso pela nossa equipa.</p>
            <p><strong>Próximo Passo:</strong> Já pode adicionar os medicamentos prescritos ao seu carrinho e prosseguir com a compra através do aplicativo Cúrati.</p>
            <p>Aceda diretamente à sua receita na aplicação para encomendar:</p>
            <p><a href="${prescriptionDeepLink}" target="_blank" rel="noopener noreferrer" style="padding: 10px 15px; background-color: #1BBA66; color: white; text-decoration: none; border-radius: 5px;">Ver Receita e Encomendar</a></p>
            <p>Se o link acima não funcionar diretamente, por favor abra a aplicação Cúrati e navegue para "Perfil" > "Receitas".</p>
            <p>Se tiver alguma dúvida, não hesite em contactar o nosso suporte.</p>
            <p>Atenciosamente,</p>
            <p><strong>Cúrati- A sua saúde é a nossa prioridade</strong></p>
            ${footerHtml}
          </body>
          </html>
        `;
    textBody = `Sua Receita Foi Validada com Sucesso!\n\nPrezado(a) ${patientName},\n\nTemos boas notícias! A sua receita médica (Número: ${prescriptionNumber}) foi validada com sucesso pela nossa equipa.\n\nPróximo Passo: Já pode adicionar os medicamentos prescritos ao seu carrinho e prosseguir com a compra através do aplicativo Cúrati.\n\nAceda diretamente à sua receita na aplicação para encomendar:\n${prescriptionDeepLink}\n(Nota: Se o link não abrir a aplicação, por favor navegue manualmente para Perfil > Receitas dentro da app Cúrati).\n\nSe tiver alguma dúvida, não hesite em contactar o nosso suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

  } else {
    subject = `Cúrati: Atualização Importante Sobre Sua Receita (${prescriptionNumber})`;
    htmlBody = `
          <html>
          <head><style>body { font-family: sans-serif; } p { margin-bottom: 10px; }</style></head>
          <body>
            <h1>Atualização Sobre a Sua Receita</h1>
            <p>Prezado(a) ${patientName},</p>
            <p>Gostaríamos de informar sobre o estado da sua receita médica (Número: <strong>${prescriptionNumber}</strong>).</p>
            <p>Infelizmente, a validação não pôde ser concluída neste momento (Estado: ${convertPrescriptionStatus(prescriptionStatus)}).</p>
            <p><strong>O que fazer:</strong> Recomendamos que entre em contacto com o seu médico prescritor para discutir os próximos passos ou, se preferir, contacte o nosso suporte ao cliente para assistência.</p>
            <p>Email Suporte: ${supportEmail}</p>
            <p>Telefone Suporte: +258 ${supportPhone}</p>
            <p>Lamentamos qualquer inconveniente que isto possa causar.</p>
            <p>Atenciosamente,</p>
            <p><strong>Cúrati- A sua saúde é a nossa prioridade</strong></p>
            ${footerHtml}
          </body>
          </html>
        `;
    textBody = `Atualização Sobre a Sua Receita\n\nPrezado(a) ${patientName},\n\nGostaríamos de informar sobre o estado da sua receita médica (Número: ${prescriptionNumber}).\n\nInfelizmente, a validação não pôde ser concluída neste momento (Estado: ${convertPrescriptionStatus(prescriptionStatus)}).\n\n' */ ''}\nO que fazer: Recomendamos que entre em contacto com o seu médico prescritor para discutir os próximos passos ou, se preferir, contacte o nosso suporte ao cliente para assistência.\n\nEmail Suporte: ${supportEmail}\nTelefone Suporte: +258 ${supportPhone}\n\nLamentamos qualquer inconveniente que isto possa causar.\n\nAtenciosamente,\nCúrati- A sua saúde é a nossa prioridade${footerText}`;
  }

  const params: SendEmailCommandInput = {
    FromEmailAddress: env.VERIFIED_SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
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
