import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { DeliveryStatus, Invoice, MedicineOrder, MedicineOrderStatus, Patient } from "../../../helpers/types/schema";
import { newMedicineOrderInvoicePatientEmailNotifier } from "../../helpers/new-medicine-order-invoice-patient-email-notifier";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoicePaymentMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage) as Invoice;
  const { invoiceNumber, invoiceSourceId, patientId, dueDate, totalAmount, documentUrl, status, deliveryFee, subTotal, discount, taxes, createdAt } = invoice

  const { errors: orderUpdateErrors } = await dbClient.models.medicineOrder.update({
    id: invoiceSourceId,
    status: MedicineOrderStatus.PROCESSING
  })

  if (orderUpdateErrors) {
    throw new Error(`Failed to update order: ${JSON.stringify(orderUpdateErrors)}`);
  }

  const { errors: deliveryUpdateErrors } = await dbClient.models.delivery.update({
    orderId: invoiceSourceId,
    status: DeliveryStatus.PHARMACY_PREPARING,
  })

  if (deliveryUpdateErrors) {
    throw new Error(`Failed to update delivery: ${JSON.stringify(deliveryUpdateErrors)}`);
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
  const order = orderData as unknown as MedicineOrder;

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