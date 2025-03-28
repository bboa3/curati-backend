import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { MedicineOrder, Patient } from '../../helpers/types/schema';
import { createBilling } from '../helpers/create-billing';
import { newInvoicePatientEmailNotifier } from '../helpers/new-invoice-patient-email-notifier';
import { reserveStockInventories } from '../helpers/reserve-stock-inventories';
import { updatePrescriptionRefillsRemaining } from '../helpers/update-prescription-refills-remaining';

interface TriggerInput {
  deliveryImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderCreation = async ({ deliveryImage, dbClient, logger }: TriggerInput) => {
  const orderId = deliveryImage?.id?.S;
  const patientId = deliveryImage?.patientId?.S;
  const totalDeliveryFee = deliveryImage?.totalDeliveryFee?.N;

  if (!orderId || !totalDeliveryFee || !patientId) {
    logger.warn("Missing required order fields");
    return;
  }

  const { data: orderData, errors: orderErrors } = await dbClient.models.medicineOrder.get({ id: orderId });

  if (orderErrors || !orderData) {
    logger.error("Failed to fetch order", { errors: orderErrors });
    return;
  }
  const order = orderData as unknown as MedicineOrder

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
  }
  const patient = patientData as unknown as Patient

  await reserveStockInventories({
    client: dbClient,
    logger,
    orderId
  })

  if (order.prescriptionId) {
    await updatePrescriptionRefillsRemaining({
      client: dbClient,
      logger,
      prescriptionId: order.prescriptionId
    })
  }

  const invoice = await createBilling({
    client: dbClient,
    logger,
    orderId,
    totalDeliveryFee: Number(totalDeliveryFee),
    pharmacyId: order.businessId,
    patientId: order.patientId
  });

  if (patient?.email && invoice) {
    await newInvoicePatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: orderId,
      invoice
    });
  }
};