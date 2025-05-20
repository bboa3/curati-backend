import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Business, Delivery, DeliveryStatus, MedicineOrder, Professional } from '../../helpers/types/schema';
import { createMedicineOrderConfirmationRequiredNotification } from "../helpers/create-medicine-order-confirmation-required-notification";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderPayment = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const order = unmarshall(medicineOrderImage as any) as MedicineOrder;
  const { id: orderId, businessId: pharmacyId } = order;

  const { data: deliveryData, errors: deliveryErrors } = await dbClient.models.delivery.get({ orderId });

  if (deliveryErrors || !deliveryData) {
    throw new Error(`Failed to fetch delivery: ${JSON.stringify(deliveryErrors)}`);
  }
  const delivery = deliveryData as unknown as Delivery;

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });
  const pharmacy = pharmacyData as unknown as Business;

  if (pharmacyErrors || !pharmacy) {
    throw new Error(`Failed to fetch pharmacy: ${JSON.stringify(pharmacyErrors)}`);
  }

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

  await createMedicineOrderConfirmationRequiredNotification({
    dbClient,
    pharmacists,
    order,
    pharmacy,
    delivery
  });
};