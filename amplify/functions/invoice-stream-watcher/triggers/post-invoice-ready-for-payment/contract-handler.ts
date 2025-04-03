import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Contract } from "../../../helpers/types/schema";
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

  if (!invoiceId || !invoiceSourceId || !invoiceTotalAmount) {
    logger.warn("Missing required invoice fields");
    return;
  }

  const { data: contractData, errors: contractErrors } = await dbClient.models.contract.get({ id: invoiceSourceId });

  if (contractErrors || !contractData) {
    logger.error("Failed to fetch contract", { errors: contractErrors });
    return;
  }
  const contract = contractData as unknown as Contract;

  await createInvoiceTransaction({
    client: dbClient,
    logger,
    invoiceId: invoiceId,
    paymentMethodId: contract.paymentMethodId,
    amount: Number(invoiceTotalAmount)
  });
};