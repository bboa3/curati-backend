import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { InvoiceStatus } from "../../../helpers/types/schema";
import { createInvoiceTransaction } from "../../helpers/create-invoice-transaction";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoiceId = invoiceImage?.id?.S;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const paymentMethodId = invoiceImage?.paymentMethodId?.S;

  if (!invoiceId || !invoiceSourceId || !invoiceTotalAmount || !paymentMethodId) {
    throw new Error("Missing required invoice fields");
  }

  await createInvoiceTransaction({
    client: dbClient,
    invoiceId: invoiceId,
    paymentMethodId: paymentMethodId,
    amount: Number(invoiceTotalAmount)
  });

  // update Invoice On a Successful Payment
  const { errors: invoiceUpdateErrors } = await dbClient.models.invoice.update({
    id: invoiceSourceId,
    status: InvoiceStatus.PAID
  });

  if (invoiceUpdateErrors) {
    throw new Error(`Failed to update invoice: ${JSON.stringify(invoiceUpdateErrors)}`);
  }
};