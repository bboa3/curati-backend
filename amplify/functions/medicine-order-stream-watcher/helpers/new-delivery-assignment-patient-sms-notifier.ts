import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { DeliveryType } from "../../helpers/types/schema";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  pharmacyName: string;
  deliveryType: DeliveryType;
  orderNumber: string;
}

export async function newDeliveryAssignmentPatientSMSNotifier({ phoneNumber, pharmacyName, orderNumber, deliveryType }: NotifierInput) {
  let message: string;

  if (deliveryType === DeliveryType.PICKUP) {
    message = `Curati: Sua encomenda (${orderNumber}) está PRONTA p/ retirada na Farmácia ${pharmacyName}. Verifique email/app Cúrati p/ detalhes e horário.`;
  } else {
    message = `Curati: Sua encomenda (${orderNumber}) está PRONTA p/ ENTREGA e será despachada em breve. Acompanhe o estado no app Cúrati.`;
  }

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

