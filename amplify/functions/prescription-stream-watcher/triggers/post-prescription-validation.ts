import { Logger } from "@aws-lambda-powertools/logger";
import { AttributeValue } from "aws-lambda";
import { Patient, PrescriptionStatus } from '../../helpers/types/schema';
import { validatedPrescriptionPatientEmailNotifier } from '../helpers/validated-prescription-patient-email-notifier';
import { validatedPrescriptionPatientSMSNotifier } from '../helpers/validated-prescription-patient-sms-notifier';

interface TriggerInput {
  prescriptionImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postPrescriptionValidation = async ({ prescriptionImage, dbClient, logger }: TriggerInput) => {
  const prescriptionNumber = prescriptionImage?.prescriptionNumber?.S;
  const prescriptionId = prescriptionImage?.prescriptionId?.S;
  const prescriptionStatus = prescriptionImage?.status?.S as PrescriptionStatus;
  const patientId = prescriptionImage?.patientId?.S;

  if (!prescriptionNumber || !prescriptionId || !prescriptionStatus || !patientId) {
    logger.warn("Missing required prescription fields");
    return;
  }

  const { data: patient, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patient) {
    logger.error("Failed to fetch patient", { errors: patientErrors });
    return;
  }

  const { name, email, phone } = patient as unknown as Patient;
  const prescriptionDeepLink = `curati://life.curati.www/(app)/profile/prescriptions/${prescriptionId}`;

  if (email) {
    await validatedPrescriptionPatientEmailNotifier({
      patientName: name,
      toAddresses: [email],
      prescriptionNumber,
      prescriptionDeepLink,
      prescriptionStatus
    });
  }

  if (phone) {
    await validatedPrescriptionPatientSMSNotifier({
      patientName: name,
      phoneNumber: `+258${phone.replace(/\D/g, '')}`,
      prescriptionNumber,
      prescriptionDeepLink,
      prescriptionStatus
    });
  }
};