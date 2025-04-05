import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  deliveryDeepLink: string;
}

export async function newDeliveryAssignmentDriverSMSNotifier({ phoneNumber, deliveryNumber, deliveryDeepLink }: NotifierInput) {
  const message = `Curati Go: Nova entrega #${deliveryNumber} atribuída. Urgente: Abra a app para detalhes e iniciar rota -> ${deliveryDeepLink}`;

  const params: PublishCommandInput = {
    Message: message,
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

