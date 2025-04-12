import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { MedicineOrderStatus } from "../../../helpers/types/schema";
import { createInvoiceTransaction } from "../../helpers/create-invoice-transaction";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentMedicineOrderHandler = async ({ invoiceImage, dbClient, logger }: TriggerInput) => {
  const invoiceId = invoiceImage?.id?.S;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const paymentMethodId = invoiceImage?.paymentMethodId?.S;

  if (!invoiceId || !invoiceSourceId || !invoiceTotalAmount || !paymentMethodId) {
    logger.warn("Missing required invoice fields");
    return;
  }

  await createInvoiceTransaction({
    client: dbClient,
    logger,
    invoiceId: invoiceId,
    paymentMethodId: paymentMethodId,
    amount: Number(invoiceTotalAmount)
  });


  // update order On a Successful Payment
  const { errors: orderUpdateErrors } = await dbClient.models.medicineOrder.update({
    id: invoiceSourceId,
    status: MedicineOrderStatus.PROCESSING
  });

  if (orderUpdateErrors) {
    logger.error("Failed to update order", { errors: orderUpdateErrors });
    return;
  }
};