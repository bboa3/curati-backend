import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  deliveryOpportunityDeepLink: string;
}

export async function sendDeliveryOpportunitySMSNotifier({ phoneNumber, deliveryNumber, deliveryOpportunityDeepLink }: NotifierInput) {
  const message = `Curati Go: Oportunidade de entrega #${deliveryNumber}! Urgente: Seja o primeiro a aceitar na app! Vaga expira breve -> ${deliveryOpportunityDeepLink}`;

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

