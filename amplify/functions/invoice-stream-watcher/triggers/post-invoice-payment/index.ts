import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { InvoiceSourceType } from "../../../helpers/types/schema";
import { postInvoicePaymentContractHandler } from "./contract-handler";
import { postInvoicePaymentMedicineOrderHandler } from "./medicine-order-handler";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoicePayment = async ({ invoiceImage, dbClient, logger }: TriggerInput) => {
  const invoiceSourceType = invoiceImage?.invoiceSourceType?.S as InvoiceSourceType;

  if (invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) {
    await postInvoicePaymentMedicineOrderHandler({ invoiceImage, dbClient, logger });
    return;
  }

  if (invoiceSourceType === InvoiceSourceType.CONTRACT) {
    await postInvoicePaymentContractHandler({ invoiceImage, dbClient, logger });
    return;
  }
};