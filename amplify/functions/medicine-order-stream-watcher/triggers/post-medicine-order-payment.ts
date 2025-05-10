import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { DeliveryStatus, MedicineOrder, Professional } from '../../helpers/types/schema';
import { newOrderPharmacyEmailNotifier } from '../helpers/new-order-pharmacy-email-notifier';
import { newOrderPharmacySMSNotifier } from '../helpers/new-order-pharmacy-sms-notifier';

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderPayment = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const order = unmarshall(medicineOrderImage as any) as MedicineOrder;
  const { id: orderId, orderNumber, businessId: pharmacyId } = order;

  const { data: pharmacistsData, errors: pharmacistErrors } = await dbClient.models.professional.list({
    filter: { businessId: { eq: pharmacyId } }
  });

  if (pharmacistErrors || !pharmacistsData) {
    throw new Error(`Failed to fetch pharmacists: ${JSON.stringify(pharmacistErrors)}`);
  }
  const pharmacists = pharmacistsData as Professional[]

  await dbClient.models.delivery.update({
    orderId,
    status: DeliveryStatus.PHARMACY_PREPARING
  });

  const emails = pharmacists.map((p: Professional) => p.email).filter(Boolean);
  const phones = pharmacists.map((p) => `+258${p.phone.replace(/\D/g, '')}`).filter(Boolean);
  if (emails.length > 0) {
    await newOrderPharmacyEmailNotifier(
      emails,
      orderNumber
    );
  }

  if (phones.length > 0) {
    await Promise.all(phones.map((phone) => newOrderPharmacySMSNotifier(phone, orderNumber)));
  }
};