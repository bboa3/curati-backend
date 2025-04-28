import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { formatETA } from "../../helpers/date/formatter";

const client = new SNSClient();

interface NotifierInput {
  patientPhoneNumber: string;
  orderNumber: string;
  driverName: string;
  departedAt: string;
  estimatedDeliveryDuration: number;
  trackingLink: string;
}

export async function deliveryInTransitPatientSMSNotifier({
  patientPhoneNumber,
  orderNumber,
  driverName,
  departedAt,
  estimatedDeliveryDuration,
  trackingLink,
}: NotifierInput) {
  const formattedETA = formatETA(departedAt, estimatedDeliveryDuration);
  const message = `Curati: Encomenda ${orderNumber} EM TRÂNSITO com ${driverName}. ETA: ${formattedETA}. Acompanhe ao vivo na app: ${trackingLink}`;

  const params: PublishCommandInput = {
    Message: message,
    PhoneNumber: patientPhoneNumber,
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

