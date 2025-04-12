import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Invoice, InvoiceStatus } from "../../../helpers/types/schema";
import { createInvoiceTransaction } from "../../helpers/create-invoice-transaction";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage) as Invoice;
  const { id: invoiceId, invoiceSourceId, totalAmount: invoiceTotalAmount, paymentMethodId } = invoice;

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