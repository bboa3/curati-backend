import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Business, BusinessService, ContractType, Patient, Professional } from '../../helpers/types/schema';
import { newContractProfessionalEmailNotifier } from '../helpers/new-contract-professional-email-notifier';
import { newContractProfessionalSMSNotifier } from "../helpers/new-contract-professional-sms-notifier";

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractCreation = async ({ contractImage, dbClient, logger }: TriggerInput) => {
  const contractNumber = contractImage?.contractNumber?.S;
  const businessServiceId = contractImage?.businessServiceId?.S;
  const businessId = contractImage?.businessId?.S;
  const patientId = contractImage?.patientId?.S;
  const contractType = contractImage?.type?.S as ContractType;

  if (!contractNumber || !businessServiceId || !businessId || !patientId || !contractType) {
    logger.warn("Missing required contract fields");
    return;
  }

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: businessServiceId });

  if (serviceErrors || !serviceData) {
    logger.error("Failed to fetch service", { errors: serviceErrors });
    return;
  }
  const service = serviceData as BusinessService;

  const { data: businessData, errors: businessErrors } = await dbClient.models.business.get({ id: businessId });

  if (businessErrors || !businessData) {
    logger.error("Failed to fetch business", { errors: businessErrors });
    return;
  }
  const business = businessData as Business;

  const { data: professionalData, errors: professionalErrors } = await dbClient.models.professional.get({ userId: service.professionalId });

  if (professionalErrors || !professionalData) {
    logger.error("Failed to fetch professional", { errors: professionalErrors });
    return;
  }
  const professional = professionalData as Professional;

  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
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