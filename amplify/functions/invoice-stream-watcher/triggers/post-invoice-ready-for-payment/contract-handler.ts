import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { ContractStatus } from "../../../helpers/types/schema";
import { createInvoiceTransaction } from "../../helpers/create-invoice-transaction";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentContractHandler = async ({ invoiceImage, dbClient, logger }: TriggerInput) => {
  const invoiceId = invoiceImage?.id?.S;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const paymentMethodId = invoiceImage?.paymentMethodId?.S;

  if (!invoiceId || !invoiceSourceId || !invoiceTotalAmount! || !paymentMethodId) {
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


  // update Contract On a Successfull Payment
  const { errors: contractUpdateErrors } = await dbClient.models.contract.update({
    id: invoiceSourceId,
    status: ContractStatus.PENDING_CONFIRMATION
  });

  if (contractUpdateErrors) {
    logger.error("Failed to update contract", { errors: contractUpdateErrors });
    return;
  }
};