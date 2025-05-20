import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { BusinessService, Contract, Patient, PricingCondition } from '../../helpers/types/schema';
import { createContractStatusPatientUpdateNotification } from "../helpers/create-contract-status-patient-update-notification";
import { createContractInvoice } from "../helpers/create-invoice";

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractConfirmation = async ({ contractImage, dbClient }: TriggerInput) => {
  const contract = unmarshall(contractImage as any) as Contract;
  const { id: contractId, patientId, paymentMethodId, businessId, businessServiceId, appliedPricingConditions } = contract;

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: businessServiceId });

  if (serviceErrors || !serviceData) {
    throw new Error(`Failed to fetch service: ${JSON.stringify(serviceErrors)}`);
  }
  const service = serviceData as BusinessService;

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient

  await createContractInvoice({
    client: dbClient,
    contractId: contractId,
    patientId: patientId,
    businessId: businessId,
    paymentMethodId: paymentMethodId,
    businessServiceId: businessServiceId,
    appliedPricingConditions: appliedPricingConditions as unknown as PricingCondition[]
  });

  await createContractStatusPatientUpdateNotification({
    dbClient,
    contract,
    patient,
    service
  });
};