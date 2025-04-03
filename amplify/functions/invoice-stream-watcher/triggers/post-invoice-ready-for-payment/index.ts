import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { InvoiceSourceType } from "../../../helpers/types/schema";
import { postInvoiceReadyForPaymentContractHandler } from "./contract-handler";
import { postInvoiceReadyForPaymentMedicineOrderHandler } from "./medicine-order-handler";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceReadyForPayment = async ({ invoiceImage, dbClient, logger }: TriggerInput) => {
  const invoiceSourceType = invoiceImage?.invoiceSourceType?.S as InvoiceSourceType;

  if (invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER) {
    await postInvoiceReadyForPaymentMedicineOrderHandler({ invoiceImage, dbClient, logger });
    return;
  }

  if (invoiceSourceType === InvoiceSourceType.CONTRACT) {
    await postInvoiceReadyForPaymentContractHandler({ invoiceImage, dbClient, logger });
    return;
  }
};