import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { BusinessService, Contract, Patient, Professional } from '../../helpers/types/schema';
import { createContractStatusProfessionalUpdateNotification } from "../helpers/create-contract-status-professional-update-notification";

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractCreation = async ({ contractImage, dbClient }: TriggerInput) => {
  const contract = unmarshall(contractImage as any) as Contract;
  const { patientId, businessServiceId } = contract;

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: businessServiceId });

  if (serviceErrors || !serviceData) {
    throw new Error(`Failed to fetch service: ${JSON.stringify(serviceErrors)}`);
  }
  const service = serviceData as BusinessService;

  const { data: professionalData, errors: professionalErrors } = await dbClient.models.professional.get({ userId: service.professionalId });

  if (professionalErrors || !professionalData) {
    throw new Error(`Failed to fetch professional: ${JSON.stringify(professionalErrors)}`);
  }
  const professional = professionalData as Professional;

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }
  const patient = patientData as unknown as Patient;

  await createContractStatusProfessionalUpdateNotification({
    dbClient,
    contract,
    professional,
    patient,
    service
  });
};