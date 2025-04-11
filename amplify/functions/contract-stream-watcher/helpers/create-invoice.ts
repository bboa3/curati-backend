import { Logger } from "@aws-lambda-powertools/logger";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as generateUUIDv4 } from "uuid";
import { createInvoiceDueDate } from "../../helpers/create-invoice-due-date";
import { generateHashedIdentifier } from "../../helpers/generateHashedIdentifier";
import ServicePriceCalculator from "../../helpers/price/ServicePriceCalculator";
import { BusinessServicePricing, Invoice, InvoiceSourceType, InvoiceStatus, PaymentTermsType, PricingCondition } from "../../helpers/types/schema";

const servicePriceCalculator = new ServicePriceCalculator();
dayjs.extend(utc);

interface UpdateInventoriesInput {
  client: any;
  logger: Logger;
  contractId: string;
  patientId: string;
  businessId: string;
  paymentMethodId: string;
  businessServiceId: string;
  appliedPricingConditions: PricingCondition[];
}

export const createContractInvoice = async ({ client, logger, patientId, businessId, contractId, paymentMethodId, businessServiceId, appliedPricingConditions }: UpdateInventoriesInput) => {
  const { data: servicePricingData, errors: pricingErrors } = await client.models.businessServicePricing.list({
    filter: { businessServiceId: { eq: businessServiceId } }
  });

  if (pricingErrors || !servicePricingData) {
    logger.error("Failed to fetch medicine pricing items", { errors: pricingErrors });
    return;
  }
  const businessServicePricing = servicePricingData as BusinessServicePricing[] || [];

  const { subTotal, discount, taxes, totalAmount } = servicePriceCalculator.calculateServiceTotal({
    businessServicePricing,
    appliedPricingConditions
  });

  const paymentTerms = PaymentTermsType.NET_1
  const invoiceId = generateUUIDv4();
  const invoiceNumber = await generateHashedIdentifier(invoiceId);
  const dueDate = createInvoiceDueDate(paymentTerms);

  const { data: invoice, errors } = await client.models.invoice.create({
    id: invoiceId,
    invoiceNumber: invoiceNumber,
    patientId: patientId,
    businessId: businessId,
    paymentMethodId: paymentMethodId,
    dueDate: dueDate,
    invoiceSourceType: InvoiceSourceType.CONTRACT,
    invoiceSourceId: contractId,
    subTotal: subTotal,
    discount: discount,
    deliveryFee: 0,
    taxes: taxes,
    totalAmount: totalAmount,
    status: InvoiceStatus.AWAITING_PATIENT_REVIEW,
    paymentTerms: paymentTerms
  });

  if (errors || !invoice) {
    logger.error(`Failed to create invoice`, { errors });
    return;
  }

  return invoice as unknown as Invoice
}