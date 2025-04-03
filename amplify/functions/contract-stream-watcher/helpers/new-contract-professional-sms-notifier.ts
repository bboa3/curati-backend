import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient();

interface NotifierInput {
  phoneNumber: string;
  contractNumber: string;
  patientName: string;
  contractDeepLink: string;
}

export async function newContractProfessionalSMSNotifier({ phoneNumber, contractNumber, patientName, contractDeepLink }: NotifierInput) {
  const message = `Curati Pro: Confirmação necessária p/ novo contrato (${contractNumber}). Paciente: ${patientName}. Reveja e confirme na app: ${contractDeepLink}`;

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

