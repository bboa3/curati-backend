import { Logger } from "@aws-lambda-powertools/logger";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as generateUUIDv4 } from "uuid";
import { createInvoiceDueDate } from "../../helpers/create-invoice-due-date";
import { generateHashedIdentifier } from "../../helpers/generateHashedIdentifier";
import PriceCalculator from "../../helpers/price/priceCalculator";
import { Invoice, InvoiceSourceType, InvoiceStatus, MedicineOrderItem, PaymentTermsType } from "../../helpers/types/schema";
dayjs.extend(utc);

const priceCalculator = new PriceCalculator();

interface UpdateInventoriesInput {
  client: any;
  logger: Logger;
  pharmacyId: string;
  patientId: string;
  orderId: string;
  totalDeliveryFee: number;
}

export const createMedicineOrderInvoice = async ({ client, logger, orderId, pharmacyId, patientId, totalDeliveryFee }: UpdateInventoriesInput) => {
  const { data: orderItemsData, errors: orderErrors } = await client.models.medicineOrderItem.list({
    filter: { orderId: { eq: orderId } }
  });

  if (orderErrors || !orderItemsData) {
    logger.error("Failed to fetch medicine order items", { errors: orderErrors });
    return;
  }
  const orderItems = orderItemsData as MedicineOrderItem[] || [];

  const calculated = priceCalculator.calculateTotalOrder({
    items: orderItems.map(item => ({ quantity: item.quantity, unit_price: item.unitPrice })),
    discounts: []
  });
  const totalAmountWithDelivery = calculated.totalAmount + totalDeliveryFee;

  const paymentTerms = PaymentTermsType.NET_1
  const invoiceId = generateUUIDv4();
  const invoiceNumber = await generateHashedIdentifier(invoiceId);
  const dueDate = createInvoiceDueDate(paymentTerms);

  const { data: invoice, errors } = await client.models.invoice.create({
    id: invoiceId,
    invoiceNumber: invoiceNumber,
    patientId: patientId,
    businessId: pharmacyId,
    dueDate: dueDate,
    invoiceSourceType: InvoiceSourceType.MEDICINE_ORDER,
    invoiceSourceId: orderId,
    subTotal: calculated.subTotal,
    discount: calculated.discount,
    deliveryFee: totalDeliveryFee,
    taxes: calculated.taxes,
    totalAmount: totalAmountWithDelivery,
    status: InvoiceStatus.PENDING_PAYMENT,
    paymentTerms: paymentTerms
  });

  if (errors || !invoice) {
    logger.error(`Failed to create invoice`, { errors });
    return;
  }

  return invoice as unknown as Invoice
}