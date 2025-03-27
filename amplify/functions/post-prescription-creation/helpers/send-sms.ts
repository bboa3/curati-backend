import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

export async function sendNotificationSMS(phoneNumber: string, prescriptionNumber: string) {
  const message = `Validação de Nova Receita Necessária\n\nUma nova prescrição foi submetida e aguarda a sua validação no sistema Cúrati.\n\nNúmero da Receita: ${prescriptionNumber}\n\nAção Necessária: Por favor, acesse a plataforma para revisar e validar a prescrição o mais breve possível.`;

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

