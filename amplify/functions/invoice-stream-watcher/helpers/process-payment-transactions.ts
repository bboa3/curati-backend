import dayjs from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { generateHashedIdentifier } from "../../helpers/generateHashedIdentifier";
import { InvoiceStatus, PaymentTransactionStatus } from "../../helpers/types/schema";

interface UpdateInventoriesInput {
  client: any;
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
}

export const processPaymentTransactions = async ({ client, invoiceId, paymentMethodId, amount }: UpdateInventoriesInput) => {
  const now = dayjs().utc();
  const temporaryTransactionId = await generateHashedIdentifier(invoiceId, 'TEMP');

  const { data, errors } = await client.models.paymentTransaction.create({
    id: generateUUIDv4(),
    invoiceId: invoiceId,
    paymentMethodId: paymentMethodId,
    transactionID: temporaryTransactionId, // Should be updated with external transaction ID
    amount: amount,
    transactionDate: now.toISOString(),
    status: PaymentTransactionStatus.PENDING,
  });

  if (errors || !data) {
    throw new Error(`Failed to create payment transaction: ${JSON.stringify(errors)}`);
  }

  const { errors: invoiceUpdateErrors } = await client.models.invoice.update({
    id: invoiceId,
    status: InvoiceStatus.PAID
  });

  if (invoiceUpdateErrors) {
    throw new Error(`Failed to update invoice: ${JSON.stringify(invoiceUpdateErrors)}`);
  }
}