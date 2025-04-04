import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { AppointmentType } from "../../helpers/types/schema";

const client = new SNSClient();

interface SendInput {
  recipientPhoneNumber: string;
  starterName: string;
  appointmentNumber: string;
  appointmentType: AppointmentType;
  appointmentJoinLink: string;
}

export async function startedAppointmentSMSNotifier({
  recipientPhoneNumber,
  starterName,
  appointmentNumber,
  appointmentType,
  appointmentJoinLink,
}: SendInput) {
  let message: string;

  if (appointmentType === AppointmentType.IN_PERSON) {
    message = `Curati: ${starterName} iniciou a consulta presencial (${appointmentNumber}). Por favor, dirija-se ao local combinado.`;
  } else {
    message = `Curati: ${starterName} iniciou a sessão (${appointmentNumber}). Entre agora pela app: ${appointmentJoinLink}`;
  }

  const params: PublishCommandInput = {
    Message: message,
    PhoneNumber: recipientPhoneNumber,
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