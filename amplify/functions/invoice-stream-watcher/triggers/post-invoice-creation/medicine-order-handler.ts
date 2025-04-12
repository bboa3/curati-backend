import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Invoice, MedicineOrder, Patient } from "../../../helpers/types/schema";
import { newMedicineOrderInvoicePatientEmailNotifier } from "../../helpers/new-medicine-order-invoice-patient-email-notifier";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCreationMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage) as Invoice;
  const { invoiceNumber, invoiceSourceId, deliveryFee, status, patientId, createdAt, dueDate, subTotal, discount, taxes, totalAmount, documentUrl } = invoice

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

  if (patient.email) {
    await newMedicineOrderInvoicePatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      orderNumber: order.orderNumber,
      invoiceNumber,
      invoiceDueDate: dueDate,
      invoiceStatus: status,
      invoiceSubTotal: subTotal,
      invoiceDiscount: discount,
      invoiceTotalTax: taxes,
      invoiceTotalAmount: totalAmount,
      totalDeliveryFee: deliveryFee,
      invoiceDocumentUrl: documentUrl || undefined,
      invoiceCreatedAt: createdAt
    });
  }
};