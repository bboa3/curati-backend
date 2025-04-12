import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { BusinessService, Contract, ContractStatus, Patient } from "../../../helpers/types/schema";
import { failedContractInvoicePatientEmailNotifier } from "../../helpers/failed-contract-invoice-patient-email-notifier";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCancellationContractHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoiceNumber = invoiceImage?.invoiceNumber?.S;
  const invoiceDueDate = invoiceImage?.dueDate?.S;
  const invoiceTotalAmount = invoiceImage?.totalAmount?.N;
  const invoiceSourceId = invoiceImage?.invoiceSourceId?.S;
  const patientId = invoiceImage?.patientId?.S;

  if (!invoiceNumber || !invoiceSourceId || !patientId || !invoiceDueDate || !invoiceTotalAmount) {
    throw new Error("Missing required invoice fields");
  }

  const { errors: contractUpdateErrors } = await dbClient.models.contract.update({
    id: invoiceSourceId,
    status: ContractStatus.SUSPENDED
  })

  if (contractUpdateErrors) {
    throw new Error(`Failed to update contract: ${JSON.stringify(contractUpdateErrors)}`);
  }

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient

  const { data: contractData, errors: contractErrors } = await dbClient.models.contract.get({ id: invoiceSourceId });

  if (contractErrors || !contractData) {
    throw new Error(`Failed to fetch contract: ${JSON.stringify(contractErrors)}`);
  }
  const contract = contractData as unknown as Contract

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: contract.businessServiceId });

  if (serviceErrors || !serviceData) {
    throw new Error(`Failed to fetch service: ${JSON.stringify(serviceErrors)}`);
  }
  const service = serviceData as unknown as BusinessService;

  const invoiceDeepLink = `curati://life.curati.www/(app)/profile/invoices/${invoiceNumber}`

  if (patient.email) {
    await failedContractInvoicePatientEmailNotifier({
      patientName: patient.name,
      patientEmail: patient.email,
      contractNumber: contract.contractNumber,
      invoiceNumber,
      invoiceTotalAmount: Number(invoiceTotalAmount),
      serviceName: service.serviceName,
      invoiceDeepLink,
      invoiceDueDate
    });
  }
};