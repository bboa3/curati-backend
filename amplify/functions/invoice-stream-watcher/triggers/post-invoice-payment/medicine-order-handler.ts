import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { DeliveryStatus, InvoiceStatus, MedicineOrder, MedicineOrderStatus, Patient } from "../../../helpers/types/schema";
import { newMedicineOrderInvoicePatientEmailNotifier } from "../../helpers/new-medicine-order-invoice-patient-email-notifier";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoicePaymentMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoiceNumber = invoiceImage?.invoiceNumber?.S;
  const invoiceCreatedAt = invoiceImage?.createdAt?.S;
  const invoiceDueDate = invoiceImage?.dueDate?.S;
  const invoiceSubTotal = invoiceImage?.subTotal?.N;
  const invoiceDiscount = invoiceImage?.discount?.N;
  const deliveryFee = invoiceImage?.deliveryFee?.N;
  const invoiceTotalTax = invoiceImage?.taxes?.N;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceDocumentUrl = invoiceImage?.documentUrl?.S;
  const invoiceStatus = invoiceImage?.status?.S as InvoiceStatus;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const patientId = invoiceImage?.patientId?.S;

  if (!invoiceNumber || !invoiceSourceId || !invoiceStatus || !patientId || !invoiceCreatedAt || !invoiceDueDate || !deliveryFee || !invoiceSubTotal || !invoiceDiscount || !invoiceTotalTax || !invoiceTotalAmount) {
    throw new Error("Missing required invoice fields");
  }

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
      invoiceDueDate,
      invoiceStatus,
      invoiceSubTotal: Number(invoiceSubTotal),
      invoiceDiscount: Number(invoiceDiscount),
      invoiceTotalTax: Number(invoiceTotalTax),
      invoiceTotalAmount: Number(invoiceTotalAmount),
      totalDeliveryFee: Number(deliveryFee),
      invoiceDocumentUrl,
      invoiceCreatedAt,
    });
  }
};