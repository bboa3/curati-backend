import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { ContractStatus } from "../../../helpers/types/schema";
import { createInvoiceTransaction } from "../../helpers/create-invoice-transaction";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentContractHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoiceId = invoiceImage?.id?.S;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const paymentMethodId = invoiceImage?.paymentMethodId?.S;

  if (!invoiceId || !invoiceSourceId || !invoiceTotalAmount! || !paymentMethodId) {
    throw new Error("Missing required invoice fields");
  }

  await createInvoiceTransaction({
    client: dbClient,
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
    throw new Error(`Failed to update contract: ${JSON.stringify(contractUpdateErrors)}`);
  }
};