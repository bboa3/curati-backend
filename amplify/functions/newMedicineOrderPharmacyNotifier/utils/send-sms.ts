import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

export async function sendOrderNotificationSMS(phoneNumber: string, orderNumber: string) {
  const params: PublishCommandInput = {
    Message: `Novo Pedido de Medicamentos - Ação Necessária\n\nPrezado(a) farmacêutico(a),\n\nUm novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega. \n\nPor favor, acesse o sistema para processar este pedido o mais breve possível.\n\nAtenciosamente,\n\nCopyright © 2024-2025 Cúrati Saúde, LDA. Todos os direitos reservados.`,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'Curati'
      },
    }
  };

  const command = new PublishCommand(params);
  return await client.send(command);
}

