import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Business, BusinessService, Contract, Patient, Professional } from '../../helpers/types/schema';
import { newContractProfessionalEmailNotifier } from '../helpers/new-contract-professional-email-notifier';
import { newContractProfessionalSMSNotifier } from "../helpers/new-contract-professional-sms-notifier";

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractCreation = async ({ contractImage, dbClient }: TriggerInput) => {
  const contract = unmarshall(contractImage) as Contract;
  const { contractNumber, patientId, businessId, businessServiceId, type: contractType } = contract;

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: businessServiceId });

  if (serviceErrors || !serviceData) {
    throw new Error(`Failed to fetch service: ${JSON.stringify(serviceErrors)}`);
  }
  const service = serviceData as BusinessService;

  const { data: businessData, errors: businessErrors } = await dbClient.models.business.get({ id: businessId });

  if (businessErrors || !businessData) {
    throw new Error(`Failed to fetch business: ${JSON.stringify(businessErrors)}`);
  }
  const business = businessData as Business;

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

  const emails = [professional.email, business.email].filter(Boolean) as string[];
  const phones = [professional.phone, business.phone].filter(Boolean) as string[];

  const contractDeepLink = `curati://life.curati.www/(app)/profile/contracts/${contractNumber}`

  await newContractProfessionalEmailNotifier({
    toAddresses: emails,
    contractNumber,
    professionalName: professional.name,
    serviceName: service.serviceName,
    patientName: patient.name,
    contractType: contractType,
    contractDeepLink: contractDeepLink
  });

  await Promise.all(phones.map((phone) => phone ? newContractProfessionalSMSNotifier({
    phoneNumber: `+258${phone.replace(/\D/g, '')}`,
    contractNumber,
    patientName: patient.name,
    contractDeepLink
  }) : null));
};