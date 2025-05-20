import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { BusinessService, Contract, Invoice, Patient } from "../../../helpers/types/schema";
import { createInvoiceCreatedNotification } from "../../helpers/create-invoice-created-notification";

interface TriggerInput {
  invoiceImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postInvoiceCreationContractHandler = async ({ invoiceImage, dbClient }: TriggerInput) => {
  const invoice = unmarshall(invoiceImage as any) as Invoice;
  const { invoiceSourceId, patientId } = invoice

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

  await createInvoiceCreatedNotification({
    dbClient,
    patient,
    invoice,
    contract,
    service,
  })
};