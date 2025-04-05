import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { formatETA } from "../../helpers/date/formatter";

const client = new SNSClient();

interface NotifierInput {
  patientPhoneNumber: string;
  orderNumber: string;
  driverName: string;
  pickedUpAt: string;
  estimatedDeliveryDuration: number;
  trackingLink: string;
}

export async function deliveryPickedUpByDriverPatientSMSNotifier({
  patientPhoneNumber,
  orderNumber,
  driverName,
  pickedUpAt,
  estimatedDeliveryDuration,
  trackingLink,
}: NotifierInput) {
  const formattedETA = formatETA(pickedUpAt, estimatedDeliveryDuration);
  const message = `Curati: Encomenda ${orderNumber} a caminho! Motorista ${driverName} recolheu. ETA: ${formattedETA}. Acompanhe na app: ${trackingLink}`;

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

