import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { formatDateTimeNumeric } from "../../helpers/date/formatter";
import { AppointmentParticipantType, AppointmentStatus } from "../../helpers/types/schema";
import { convertAppointmentStatus } from "./appointment-status";

const client = new SNSClient();

interface SendInput {
  recipientPhoneNumber: string;
  otherPartyName: string;
  recipientType: AppointmentParticipantType;
  appointmentNumber: string;
  appointmentDateTime: string | Date;
  appointmentDeepLink: string;
  finalStatus: AppointmentStatus;
}

export async function confirmedAppointmentSMSNotifier({
  recipientPhoneNumber,
  otherPartyName,
  recipientType,
  appointmentNumber,
  appointmentDateTime,
  appointmentDeepLink,
  finalStatus
}: SendInput) {

  const formattedDateTime = formatDateTimeNumeric(appointmentDateTime);
  const formattedStatus = convertAppointmentStatus(finalStatus);
  const isRecipientPatient = recipientType === AppointmentParticipantType.PATIENT;
  const otherPartyText = isRecipientPatient ? `com ${otherPartyName}` : `com Pct ${otherPartyName}`;

  let message: string;

  if (finalStatus === AppointmentStatus.CONFIRMED) {
    message = `Curati: Agendamento ${appointmentNumber} ${otherPartyText} p/ ${formattedDateTime} CONFIRMADO. Detalhes na app: ${appointmentDeepLink}`;
  } else { // CANCELLED / FAILED
    message = `Curati: Agendamento ${appointmentNumber} ${otherPartyText} p/ ${formattedDateTime} foi ${formattedStatus}. ${isRecipientPatient ? 'Pode tentar reagendar na app ou contactar suporte.' : 'Horário libertado.'} App: ${appointmentDeepLink}`;
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