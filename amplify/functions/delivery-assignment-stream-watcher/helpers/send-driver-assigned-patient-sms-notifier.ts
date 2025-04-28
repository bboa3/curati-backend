import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  deliveryNumber: string;
  deliveryTrackingDeepLink: string;
}

export async function sendDriverAssignedPatientSMSNotifier({ phoneNumber, deliveryNumber, deliveryTrackingDeepLink }: NotifierInput) {
  const message = `Curati: Sua entrega #${deliveryNumber} já tem motorista! Ele(a) está a ir p/ farmácia. Acompanhe ao vivo aqui: ${deliveryTrackingDeepLink}`;

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

