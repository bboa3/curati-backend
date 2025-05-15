import { env } from '$amplify/env/contract-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";
import { ContractStatus } from "../../helpers/types/schema";
import { convertContractStatus } from "./contract-status";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


interface SendInput {
  phoneNumber: string;
  patientName: string;
  serviceName: string;
  professionalName: string;
  contractStatus: ContractStatus;
  contractNumber: string;
  invoiceNumber?: string;
  paymentDeepLink: string;
}

export async function confirmedContractPatientSMSNotifier({
  patientName,
  serviceName,
  professionalName,
  contractStatus,
  phoneNumber,
  contractNumber,
  paymentDeepLink,
  invoiceNumber,
}: SendInput) {
  let message: string;

  if (contractStatus === ContractStatus.ACTIVE) {
    if (!invoiceNumber || !paymentDeepLink) {
      throw new Error(`Invoice details missing for ACTIVE contract ${contractNumber}`);
    }

    message = `Curati: Excelente notícia ${patientName}! O seu contrato de serviço (Nº ${contractNumber}) para "${serviceName}" com ${professionalName} foi confirmado com sucesso. Uma fatura (Nº ${invoiceNumber}) foi gerada, faça o pagamento no app p/ agendar a consulta: ${paymentDeepLink}`;
  } else {
    const formattedContractStatus = convertContractStatus(contractStatus);
    message = `Curati: Atualização Contrato ${contractNumber}. Estado: ${formattedContractStatus}. Contacte o nosso suporte para mais detalhes.`;
  }

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

