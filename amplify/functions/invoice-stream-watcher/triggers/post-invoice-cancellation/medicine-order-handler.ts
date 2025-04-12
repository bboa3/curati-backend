import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { MedicineOrder, MedicineOrderStatus, Patient } from "../../../helpers/types/schema";
import { failedMedicineOrderInvoicePatientEmailNotifier } from "../../helpers/failed-medicine-order-invoice-patient-email-notifier";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCancellationMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoiceNumber = invoiceImage?.invoiceNumber?.S;
  const invoiceDueDate = invoiceImage?.dueDate?.S;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const patientId = invoiceImage?.patientId?.S;

  if (!invoiceNumber || !invoiceSourceId || !patientId || !invoiceDueDate || !invoiceTotalAmount) {
    throw new Error("Missing required invoice fields");
  }

  const { errors: orderUpdateErrors } = await dbClient.models.medicineOrder.update({
    id: invoiceSourceId,
    status: MedicineOrderStatus.PENDING_PAYMENT
  })

  if (orderUpdateErrors) {
    throw new Error(`Failed to update order: ${JSON.stringify(orderUpdateErrors)}`);
  }

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient

  const { data: orderData, errors: orderErrors } = await dbClient.models.medicineOrder.get({ id: invoiceSourceId });

  if (orderErrors || !orderData) {
    throw new Error(`Failed to fetch order: ${JSON.stringify(orderErrors)}`);
  }
  const order = orderData as unknown as MedicineOrder

  const invoiceDeepLink = `curati://life.curati.www/(app)/profile/invoices/${invoiceNumber}`

  if (patient.email) {
    await failedMedicineOrderInvoicePatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      invoiceNumber,
      invoiceDueDate,
      invoiceDeepLink,
      invoiceTotalAmount: Number(invoiceTotalAmount),
    });
  }
};