import { v4 as generateUUIDv4 } from "uuid";
import { createInvoiceDueDate } from "../../helpers/create-invoice-due-date";
import { generateHashedIdentifier } from "../../helpers/generateHashedIdentifier";
import PriceCalculator from "../../helpers/price/priceCalculator";
import { Invoice, InvoiceSourceType, InvoiceStatus, MedicineOrderItem, PaymentTermsType } from "../../helpers/types/schema";

const priceCalculator = new PriceCalculator();

interface UpdateInventoriesInput {
  client: any;
  pharmacyId: string;
  patientId: string;
  paymentMethodId: string;
  orderId: string;
  totalDeliveryFee: number;
}

export const createMedicineOrderInvoice = async ({ client, orderId, pharmacyId, paymentMethodId, patientId, totalDeliveryFee }: UpdateInventoriesInput) => {
  const { data: orderItemsData, errors: orderErrors } = await client.models.medicineOrderItem.list({
    filter: { orderId: { eq: orderId } }
  });

  if (orderErrors || !orderItemsData) {
    throw new Error(`Failed to fetch order items: ${JSON.stringify(orderErrors)}`);
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
    paymentMethodId: paymentMethodId,
    dueDate: dueDate,
    invoiceSourceType: InvoiceSourceType.MEDICINE_ORDER,
    invoiceSourceId: orderId,
    subTotal: calculated.subTotal,
    discount: calculated.discount,
    deliveryFee: totalDeliveryFee,
    taxes: calculated.taxes,
    totalAmount: totalAmountWithDelivery,
    paymentTerms: paymentTerms,
    status: InvoiceStatus.PENDING_PAYMENT,
  });

  if (errors || !invoice) {
    throw new Error(`Failed to create invoice: ${JSON.stringify(errors)}`);
  }

  return invoice as unknown as Invoice
}