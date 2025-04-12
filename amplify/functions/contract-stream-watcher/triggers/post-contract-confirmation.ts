import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { BusinessService, Contract, Patient, PricingCondition } from '../../helpers/types/schema';
import { confirmedContractPatientEmailNotifier } from '../helpers/confirmed-contract-patient-email-notifier';
import { confirmedContractPatientSMSNotifier } from '../helpers/confirmed-contract-patient-sms-notifier';
import { createContractInvoice } from "../helpers/create-invoice";

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractConfirmation = async ({ contractImage, dbClient }: TriggerInput) => {
  const contract = unmarshall(contractImage) as Contract;
  const { id: contractId, contractNumber, status: contractStatus, patientId, paymentMethodId, businessId, businessServiceId, appliedPricingConditions } = contract;

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

  const invoice = await createContractInvoice({
    client: dbClient,
    contractId: contractId,
    patientId: patientId,
    businessId: businessId,
    paymentMethodId: paymentMethodId,
    businessServiceId: businessServiceId,
    appliedPricingConditions: appliedPricingConditions as unknown as PricingCondition[]
  });

  const contractDeepLink = `curati://life.curati.www/(app)/profile/invoices/${invoice.id}`;

  if (patient?.email) {
    await confirmedContractPatientEmailNotifier({
      patientName: patient.name,
      serviceName: service.serviceName,
      professionalName: service.professionalName,
      contractStatus: contractStatus,
      toAddresses: [patient.email],
      contractNumber: contractNumber,
      invoiceNumber: invoice.invoiceNumber,
      invoiceTotalAmount: invoice.totalAmount,
      paymentDeepLink: contractDeepLink,
      invoiceDueDate: invoice.dueDate
    });
  }

  if (patient?.phone) {
    await confirmedContractPatientSMSNotifier({
      phoneNumber: `+258${patient.phone.replace(/\D/g, '')}`,
      patientName: patient.name,
      serviceName: service.serviceName,
      professionalName: service.professionalName,
      contractStatus: contractStatus,
      contractNumber: contractNumber,
      invoiceNumber: invoice.invoiceNumber,
      paymentDeepLink: contractDeepLink
    });
  }
};