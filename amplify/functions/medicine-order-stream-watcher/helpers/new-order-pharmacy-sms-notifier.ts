import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

export async function newOrderPharmacySMSNotifier(phoneNumber: string, orderNumber: string) {
  const params: PublishCommandInput = {
    Message: `Novo Pedido de Medicamentos - Ação Necessária\n\nPrezado(a) farmacêutico(a),\n\nUm novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega. \n\nPor favor, acesse o sistema para processar este pedido o mais breve possível.`,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'Curati'
      },
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional'
      }
    }
  };

  const command = new PublishCommand(params);
  return await client.send(command);
}

