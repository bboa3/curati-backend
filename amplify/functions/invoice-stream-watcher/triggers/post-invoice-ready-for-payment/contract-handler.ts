import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { ContractStatus, Invoice } from "../../../helpers/types/schema";
import { createInvoiceTransaction } from "../../helpers/create-invoice-transaction";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentContractHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage) as Invoice;
  const { id: invoiceId, invoiceSourceId, totalAmount: invoiceTotalAmount, paymentMethodId } = invoice;

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