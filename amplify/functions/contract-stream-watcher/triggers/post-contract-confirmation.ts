import { Logger } from "@aws-lambda-powertools/logger";
import { AttributeValue } from "aws-lambda";
import { BusinessService, ContractStatus, Invoice, Patient, PricingCondition } from '../../helpers/types/schema';
import { confirmedContractPatientEmailNotifier } from '../helpers/confirmed-contract-patient-email-notifier';
import { confirmedContractPatientSMSNotifier } from '../helpers/confirmed-contract-patient-sms-notifier';
import { createContractInvoice } from "../helpers/create-invoice";

interface TriggerInput {
  contractImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postContractConfirmation = async ({ contractImage, dbClient, logger }: TriggerInput) => {
  const contractNumber = contractImage?.contractNumber?.S;
  const contractId = contractImage?.id?.S;
  const contractStatus = contractImage?.status?.S as ContractStatus;
  const patientId = contractImage?.patientId?.S;
  const businessId = contractImage?.businessId?.S;
  const businessServiceId = contractImage?.businessServiceId?.S;
  const appliedPricingConditions = contractImage?.appliedPricingConditions?.SS;

  if (!contractNumber || !contractId || !contractStatus || !patientId || !businessId || !businessServiceId || !appliedPricingConditions) {
    logger.warn("Missing required contract fields");
    return;
  }

  const { data: serviceData, errors: serviceErrors } = await dbClient.models.businessService.get({ id: businessServiceId });

  if (serviceErrors || !serviceData) {
    logger.error("Failed to fetch service", { errors: serviceErrors });
    return;
  }
  const service = serviceData as BusinessService;


  const { data: patientData, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patientData) {
    logger.error("Failed to fetch patient", patientErrors);
    return;
  }
  const patient = patientData as unknown as Patient

  let invoice: Invoice | undefined = undefined;

  if (contractStatus === ContractStatus.PENDING_PAYMENT) {
    invoice = await createContractInvoice({
      client: dbClient,
      logger,
      contractId: contractId,
      patientId: patientId,
      businessId: businessId,
      businessServiceId: businessServiceId,
      appliedPricingConditions: appliedPricingConditions as unknown as PricingCondition[]
    });
  }

  const contractDeepLink = `curati://life.curati.www/(app)/profile/invoices/${contractId}`;

  if (patient?.email) {
    await confirmedContractPatientEmailNotifier({
      patientName: patient.name,
      serviceName: service.serviceName,
      professionalName: service.professionalName,
      contractStatus: contractStatus,
      toAddresses: [patient.email],
      contractNumber: contractNumber,
      invoiceNumber: invoice?.invoiceNumber,
      invoiceTotalAmount: invoice?.totalAmount,
      paymentDeepLink: contractDeepLink,
      invoiceDueDate: invoice?.dueDate
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
      invoiceNumber: invoice?.invoiceNumber,
      paymentDeepLink: contractDeepLink
    });
  }
};