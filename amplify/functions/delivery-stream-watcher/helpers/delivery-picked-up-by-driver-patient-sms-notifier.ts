import { env } from '$amplify/env/delivery-stream-watcher';
import { formatETA } from "../../helpers/date/formatter";
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});

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

  return await smsService.sendSms({
    to: patientPhoneNumber,
    message: message,
  });
}

