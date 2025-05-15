import { env } from '$amplify/env/prescription-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";
import { PrescriptionStatus } from "../../helpers/types/schema";
import { convertPrescriptionStatus } from "./prescription-status";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


interface SendInput {
  patientName: string;
  prescriptionStatus: PrescriptionStatus;
  prescriptionDeepLink: string;
  phoneNumber: string;
  prescriptionNumber: string;
}

export async function validatedPrescriptionPatientSMSNotifier({
  patientName,
  prescriptionStatus,
  phoneNumber,
  prescriptionNumber,
}: SendInput) {
  let message: string;

  if (prescriptionStatus === PrescriptionStatus.ACTIVE) {
    message = `Sua Receita Foi Validada com Sucesso! Prezado(a) ${patientName}, temos boas notícias! Sua receita (${prescriptionNumber}) foi APROVADA. Próximo Passo: Já pode adicionar os medicamentos prescritos ao seu carrinho e prosseguir com a compra através do aplicativo Cúrati.`;
  } else {
    message = `Atualização Sobre a Sua Receita. Prezado(a) ${patientName}, gostaríamos de informar sobre o estado da sua receita médica (Número: ${prescriptionNumber}). Validação não concluída (Estado: ${convertPrescriptionStatus(prescriptionStatus)}). Por favor contacte seu médico ou nosso suporte.`;
  }

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

