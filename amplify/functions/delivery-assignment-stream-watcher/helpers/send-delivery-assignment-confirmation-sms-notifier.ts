import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  pharmacyName: string;
  pharmacyAddressSnippet: string;
  assignedDeliveryDeepLink: string;
}


export async function sendDeliveryAssignmentConfirmationSMSNotifier({ phoneNumber, deliveryNumber, pharmacyName, pharmacyAddressSnippet, assignedDeliveryDeepLink }: NotifierInput) {
  const message = `Curati Go: Você conseguiu! Entrega #${deliveryNumber}. Inicie agora: vá à farmácia ${pharmacyName} (${pharmacyAddressSnippet}). App p/ rota: ${assignedDeliveryDeepLink}`;

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

