import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { BusinessService, Contract, Invoice, Patient } from "../../../helpers/types/schema";
import { newContractInvoicePatientEmailNotifier } from "../../helpers/new-contract-invoice-patient-email-notifier";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCreationContractHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage) as Invoice;
  const { invoiceNumber, invoiceSourceId, paymentTerms, status, patientId, createdAt, dueDate, subTotal, discount, taxes, totalAmount, documentUrl } = invoice

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient

  const { data: contractData, errors: contractErrors } = await dbClient.models.contract.get({ id: invoiceSourceId });

  if (contractErrors || !contractData) {
    throw new Error(`Failed to fetch contract: ${JSON.stringify(contractErrors)}`);
  }
  const contract = contractData as unknown as Contract;

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: contract.businessServiceId });

  if (serviceErrors || !serviceData) {
    throw new Error(`Failed to fetch service: ${JSON.stringify(serviceErrors)}`);
  }
  const service = serviceData as unknown as BusinessService;

  const invoiceDeepLink = `curati://life.curati.www/(app)/profile/invoices/${invoiceNumber}`

  if (patient.email) {
    await newContractInvoicePatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      contractNumber: contract.contractNumber,
      invoiceNumber,
      invoiceCreatedAt: createdAt,
      invoiceDueDate: dueDate,
      invoiceStatus: status,
      invoiceSubTotal: subTotal,
      invoiceDiscount: discount,
      invoiceTotalTax: taxes,
      invoiceTotalAmount: totalAmount,
      invoiceDocumentUrl: documentUrl || undefined,
      serviceName: service.serviceName,
      paymentTerms: paymentTerms,
      professionalName: service.professionalName,
      invoiceDeepLink: invoiceDeepLink
    });
  }
};