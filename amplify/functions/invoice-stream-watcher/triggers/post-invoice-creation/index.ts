import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { InvoiceSourceType } from "../../../helpers/types/schema";
import { postInvoiceCreationContractHandler } from "./contract-handler";
import { postInvoiceCreationMedicineOrderHandler } from "./medicine-order-handler";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCreation = async ({ invoiceImage, dbClient, logger }: TriggerInput) => {
  const invoiceSourceType = invoiceImage?.invoiceSourceType?.S as InvoiceSourceType;

  if (invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) {
    await postInvoiceCreationMedicineOrderHandler({ invoiceImage, dbClient, logger });
    return;
  }

  if (invoiceSourceType === InvoiceSourceType.CONTRACT) {
    await postInvoiceCreationContractHandler({ invoiceImage, dbClient, logger });
    return;
  }
};