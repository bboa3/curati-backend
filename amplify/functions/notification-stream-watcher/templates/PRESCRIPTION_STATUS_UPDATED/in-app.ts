import { NotificationChannel, PrescriptionStatus } from "../../../helpers/types/schema";
import { convertPrescriptionStatus } from "../../helpers/enum/prescriptionStatus";
import { InAppMessage } from "../../helpers/types";
import { TemplateData } from './schema';

interface TemplateInput {
  channel: NotificationChannel,
  templateData: TemplateData
}

export const generateInAppMessage = ({ templateData }: TemplateInput): InAppMessage => {
  const {
    prescriptionNumber,
    prescriptionStatus,
    statusReason,
  } = templateData;

  const isApproved = prescriptionStatus === PrescriptionStatus.ACTIVE;
  const friendlyStatus = convertPrescriptionStatus(prescriptionStatus as PrescriptionStatus);

  const title = `Receita #${prescriptionNumber} ${friendlyStatus}`;

  let shortMessage: string;
  let fullMessage: string;

  if (isApproved) {
    shortMessage = `Sua receita #${prescriptionNumber} foi aprovada. Pode encomendar.`;
    fullMessage = `Boas notícias! A sua receita médica nº ${prescriptionNumber} foi validada com sucesso e está ativa. Já pode adicionar os medicamentos à sua encomenda.`;
  } else {
    shortMessage = `Atualização: Receita #${prescriptionNumber} - ${friendlyStatus}.`;
    fullMessage = `Informação sobre a sua receita nº ${prescriptionNumber}: ${friendlyStatus}.`;
    if (statusReason) {
      fullMessage += ` Detalhes: ${statusReason}.`;
    }
    fullMessage += ` Por favor, verifique a receita para mais informações ou contacte o suporte.`;
  }

  return {
    title: title,
    message: fullMessage,
    shortMessage: shortMessage,
  }
};