import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  orderNumber: string;
}

export async function deliveryDriverAssignedPatientSMSNotifier({ phoneNumber, orderNumber }: NotifierInput) {
  const message = `Curati: Óptima notícia! Sua encomenda (${orderNumber}) está PRONTA p/ ENTREGA e será despachada em breve. Acompanhe o estado no app Cúrati.`;

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

