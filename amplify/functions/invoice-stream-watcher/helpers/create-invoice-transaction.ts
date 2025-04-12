import { Logger } from "@aws-lambda-powertools/logger";
import dayjs from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { generateHashedIdentifier } from "../../helpers/generateHashedIdentifier";
import { PaymentTransactionStatus } from "../../helpers/types/schema";

interface UpdateInventoriesInput {
  client: any;
  logger: Logger;
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
}

export const createInvoiceTransaction = async ({ client, logger, invoiceId, paymentMethodId, amount }: UpdateInventoriesInput) => {
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
    logger.error(`Failed to create invoice transaction`, { errors });
    return;
  }
}