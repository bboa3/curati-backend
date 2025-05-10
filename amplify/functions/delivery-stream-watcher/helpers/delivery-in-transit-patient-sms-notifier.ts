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

  return await smsService.sendSms({
    to: patientPhoneNumber,
    message: message,
  });
}

