import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Invoice } from "../../../helpers/types/schema";
import { processPaymentTransactions } from "../../helpers/process-payment-transactions";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentMedicineOrderHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage) as Invoice;
  const { id: invoiceId, totalAmount, paymentMethodId } = invoice;

  await processPaymentTransactions({
    client: dbClient,
    invoiceId: invoiceId,
    paymentMethodId: paymentMethodId,
    amount: totalAmount
  });
};