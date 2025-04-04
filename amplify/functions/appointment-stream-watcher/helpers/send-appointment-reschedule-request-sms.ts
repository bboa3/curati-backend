import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { formatDateTimeNumeric } from "../../helpers/date/formatter";
import { AppointmentParticipantType } from "../../helpers/types/schema";

const client = new SNSClient();

interface SendInput {
  recipientPhoneNumber: string;
  requesterName: string;
  requesterType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string | Date;
  appointmentDeepLink: string;
}

export async function sendAppointmentRescheduleRequestSMS({
  recipientPhoneNumber,
  requesterName,
  requesterType,
  appointmentNumber,
  appointmentDateTime,
  appointmentDeepLink,
}: SendInput) {
  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const requesterTypeText = requesterType === AppointmentParticipantType.PATIENT ? 'Paciente' : 'Profissional';

  const message = `Curati: ${requesterTypeText} ${requesterName} agendou consulta (${appointmentNumber}) p/ ${formattedDateTime}. Confirmação necessária. Confirme na app: ${appointmentDeepLink}`;

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