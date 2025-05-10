import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Contract, Invoice } from "../../../helpers/types/schema";
import { calculateContractPaymentPeriod } from "../../helpers/calculate-contract-payment-period";
import { createContractPaymentRecord } from "../../helpers/create-contract-payment-pecord";
import { processPaymentTransactions } from "../../helpers/process-payment-transactions";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPaymentContractHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage as any) as Invoice;
  const { id: invoiceId, invoiceSourceId, totalAmount: invoiceTotalAmount, paymentMethodId } = invoice;

  const { data: contractData, errors: contractErrors } = await dbClient.models.contract.get({ id: invoiceSourceId });

  if (contractErrors || !contractData) {
    throw new Error(`Failed to fetch contract: ${JSON.stringify(contractErrors)}`);
  }
  const { type: contractType, id: contractId } = contractData as unknown as Contract;

  await processPaymentTransactions({
    client: dbClient,
    invoiceId: invoiceId,
    paymentMethodId: paymentMethodId,
    amount: Number(invoiceTotalAmount)
  });

  const paymentPeriod = await calculateContractPaymentPeriod({
    contractType,
    contractId,
    dbClient
  });

  await createContractPaymentRecord({
    contractId,
    invoiceId,
    invoiceTotalAmount,
    paymentPeriod,
    dbClient
  });
};