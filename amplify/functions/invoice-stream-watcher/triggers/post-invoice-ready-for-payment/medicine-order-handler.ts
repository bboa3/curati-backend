import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
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
};