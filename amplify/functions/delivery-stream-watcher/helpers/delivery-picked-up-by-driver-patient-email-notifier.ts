import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { formatETA } from '../../helpers/date/formatter';
import { VehicleType } from '../../helpers/types/schema';
import { convertVehicleType } from './vehicle-type';

interface NotifierInput {
  patientName: string;
  patientEmail: string;
  orderNumber: string;
  deliveryNumber: string;
  pharmacyName: string;
  driverName: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleLicensePlate: string;
  pickedUpAt: string;
  estimatedDeliveryDuration: number;
  trackingLink: string;
}

const client = new SESv2Client();

export async function deliveryPickedUpByDriverPatientEmailNotifier({
  patientName,
  patientEmail,
  orderNumber,
  deliveryNumber,
  pharmacyName,
  driverName,
  vehicleModel,
  vehicleLicensePlate,
  pickedUpAt,
  vehicleType,
  estimatedDeliveryDuration,
  trackingLink,
}: NotifierInput) {
  const currentYear = new Date().getFullYear();
  const subject = `Cúrati: A Caminho! Sua Encomenda ${orderNumber} Foi Recolhida`;
  const formattedETA = formatETA(pickedUpAt, estimatedDeliveryDuration);

  const footerHtml = `
      <div class="footer">
        Copyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados.<br>
        Maputo, Moçambique.
      </div>
    `;
  const footerText = `\n\n---\nCopyright © 2024-${currentYear} Cúrati Saúde, LDA. Todos os direitos reservados. Maputo, Moçambique.`;

  const htmlHead = `<head><style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2F303A; line-height: 1.6; } .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #E2E3E7; border-radius: 8px; } h1 { color: #179E57; font-size: 1.6em; margin-bottom: 15px;} p { margin-bottom: 14px; } strong { font-weight: 600; color: #0D5E38; } .info-box { background-color: #F5F6F9; /* --color-black-50 */ padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #BEC0C7; /* --color-black-200 */} a.button { padding: 12px 25px; background-color: #1BBA66; color: #ffffff !important; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: 500; border: none; } a.button:hover { background-color: #179E57; } .footer { font-size: 0.85em; color: #777B8A; margin-top: 30px; border-top: 1px solid #E2E3E7; padding-top: 20px; text-align: center; }</style></head>`;

  const htmlBody = `
      ${htmlHead}
      <body>
        <div class="container">
          <h1>Encomenda a Caminho!</h1>
          <p>Prezado(a) ${patientName},</p>
          <p>Boas notícias! A sua encomenda de medicamentos (Nº Pedido <strong>${orderNumber}</strong> / Entrega Nº <strong>${deliveryNumber}</strong>) foi recolhida na Farmácia ${pharmacyName} pelo nosso motorista e está agora a caminho do seu endereço.</p>

          <div class="info-box">
            <p><strong>Motorista:</strong> ${driverName}</p>
            <p><strong>Veículo:</strong> ${convertVehicleType(vehicleType)} ${vehicleModel} - ${vehicleLicensePlate}</p>
            <p><strong>Estimativa de Entrega:</strong> ${formattedETA}</p>
          </div>

          <p>Pode acompanhar a entrega em tempo real e ver a localização do motorista na aplicação Cúrati:</p>
          <p><a href="${trackingLink}" class="button">Acompanhar Entrega Agora</a></p>

          <p>Por favor, certifique-se de que alguém está disponível para receber a encomenda no horário estimado.</p>

          <p>Se tiver alguma questão urgente sobre a entrega, pode contactar o nosso suporte.</p>

          <p>Atenciosamente,</p>
          <p><strong>Equipa Cúrati Saúde</strong></p>
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

  const textBody = `Encomenda a Caminho!\n\nPrezado(a) ${patientName},\n\nBoas notícias! A sua encomenda de medicamentos (Nº Pedido ${orderNumber} / Entrega Nº ${deliveryNumber}) foi recolhida na Farmácia ${pharmacyName} e está agora a caminho.\n\nMotorista: ${driverName}\n${vehicleModel && vehicleLicensePlate ? `Veículo: ${vehicleModel} - ${vehicleLicensePlate}\n` : ''}Estimativa de Entrega: ${formattedETA}\n\nAcompanhe a entrega em tempo real na app Cúrati:\n${trackingLink}\n\nPor favor, esteja disponível para receber a encomenda.\n\nQuestões? Contacte o suporte.\n\nAtenciosamente,\nEquipa Cúrati Saúde${footerText}`;

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
