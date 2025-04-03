import { env } from '$amplify/env/contract-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { ContractType } from '../../helpers/types/schema';

const client = new SESv2Client();

interface NotifierInput {
  toAddresses: string[];
  contractNumber: string;
  serviceName: string;
  professionalName: string;
  patientName: string;
  contractType: ContractType;
  contractDeepLink: string;
}

export async function newContractProfessionalEmailNotifier({ toAddresses, contractNumber, serviceName, professionalName, patientName, contractType, contractDeepLink }: NotifierInput) {
  const currentYear = new Date().getFullYear();
  const footerHtml = `
      <div style="font-size: 0.8em; color: #444444; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const subject = `Cúrati Pro: Confirmação Necessária - Contrato ${contractNumber}`;

  let formattedContractType = '';
  switch (contractType) {
    case ContractType.ONE_TIME: formattedContractType = 'Pagamento Único'; break;
    case ContractType.MONTHLY: formattedContractType = 'Mensal'; break;
    case ContractType.SEMI_ANNUALLY: formattedContractType = 'Semestral'; break;
    case ContractType.ANNUALLY: formattedContractType = 'Anual'; break;
  }

  const htmlBody = `
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
          h1 { color: #0A0D14; font-size: 1.5em; margin-bottom: 15px; }
          p { margin-bottom: 12px; }
          strong { font-weight: 600; color: #111; }
          ul { margin-top: 0; padding-left: 20px; }
          li { margin-bottom: 5px; }
          a.button { padding: 12px 25px; background-color: #1BBA66; color: white !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Confirmação de Novo Contrato</h1>
          <p>Prezado(a) ${professionalName},</p>
          <p>Um novo contrato de serviço foi iniciado através da plataforma Cúrati e necessita da sua confirmação para ser ativado.</p>

          <h2>Detalhes do Contrato:</h2>
          <ul>
            <li><strong>Número do Contrato:</strong> ${contractNumber}</li>
            <li><strong>Serviço a Prestar:</strong> ${serviceName}</li>
            <li><strong>Paciente:</strong> ${patientName}</li>
            <li><strong>Tipo de Contrato:</strong> ${formattedContractType}</li>
          </ul>

          <p><strong>Ação Necessária:</strong></p>
          <p>Por favor, reveja cuidadosamente os detalhes do contrato e confirme a sua aceitação através da plataforma Cúrati Professional o mais breve possível. A sua confirmação é essencial para ativar o contrato e permitir o agendamento dos serviços.</p>

          <a href="${contractDeepLink}" class="button">Rever e Confirmar Contrato</a>

          <p>Se tiver alguma questão sobre os termos ou detalhes deste contrato, por favor, entre em contacto com a equipa administrativa da Cúrati.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>

          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Confirmação de Novo Contrato\n\nPrezado(a) ${professionalName},\n\nUm novo contrato de serviço foi iniciado através da plataforma Cúrati e necessita da sua confirmação para ser ativado.\n\nDetalhes do Contrato:\n- Número do Contrato: ${contractNumber}\n- Serviço a Prestar: ${serviceName}\n- Paciente: ${patientName}\n- Tipo de Contrato: ${formattedContractType}\n\nAção Necessária:\nPor favor, reveja cuidadosamente os detalhes do contrato e confirme a sua aceitação através da plataforma Cúrati Professional o mais breve possível. A sua confirmação é essencial para ativar o contrato e permitir o agendamento dos serviços.\n\nRever e Confirmar Contrato: ${contractDeepLink}\n\nSe tiver alguma questão sobre os termos ou detalhes deste contrato, por favor, entre em contacto com a equipa administrativa da Cúrati.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
