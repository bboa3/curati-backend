import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { InvoiceSourceType } from "../../../helpers/types/schema";
import { postInvoiceCancellationContractHandler } from "./contract-handler";
import { postInvoiceCancellationMedicineOrderHandler } from "./medicine-order-handler";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCancellation = async ({ invoiceImage, dbClient, logger }: TriggerInput) => {
  const invoiceSourceType = invoiceImage?.invoiceSourceType?.S as InvoiceSourceType;

  if (invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) {
    await postInvoiceCancellationMedicineOrderHandler({ invoiceImage, dbClient, logger });
    return;
  }

  if (invoiceSourceType === InvoiceSourceType.CONTRACT) {
    await postInvoiceCancellationContractHandler({ invoiceImage, dbClient, logger });
    return;
  }
};