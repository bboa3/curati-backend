import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";
import { convertPrescriptionStatus, PrescriptionStatus } from "./prescriptionStatus";

const client = new SNSClient();

interface SendInput {
  patientName: string;
  prescriptionStatus: PrescriptionStatus;
  prescriptionDeepLink: string;
  phoneNumber: string;
  prescriptionNumber: string;
}

export async function patientSMSNotifier({
  patientName,
  prescriptionStatus,
  phoneNumber,
  prescriptionNumber,
}: SendInput) {
  let message: string;

  if (prescriptionStatus === PrescriptionStatus.ACTIVE) {
    message = `Sua Receita Foi Validada com Sucesso!\n\nPrezado(a) ${patientName},\n\nTemos boas notícias! Sua receita (${prescriptionNumber}) foi APROVADA.\n\nPróximo Passo: Já pode adicionar os medicamentos prescritos ao seu carrinho e prosseguir com a compra através do aplicativo Cúrati.`;
  } else {
    message = `Atualização Sobre a Sua Receita\n\nPrezado(a) ${patientName},\n\nGostaríamos de informar sobre o estado da sua receita médica (Número: ${prescriptionNumber}).\n\nValidação não concluída (Estado: ${convertPrescriptionStatus(prescriptionStatus)}). Por favor contacte seu médico ou nosso suporte.`;
  }

  const params: PublishCommandInput = {
    Message: message,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'Curati'
      },
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional'
      }
    }
  };

  const command = new PublishCommand(params);
  return await client.send(command);
}

