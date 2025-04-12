import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Patient, Prescription } from '../../helpers/types/schema';
import { validatedPrescriptionPatientEmailNotifier } from '../helpers/validated-prescription-patient-email-notifier';
import { validatedPrescriptionPatientSMSNotifier } from '../helpers/validated-prescription-patient-sms-notifier';

interface TriggerInput {
  prescriptionImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postPrescriptionValidation = async ({ prescriptionImage, dbClient }: TriggerInput) => {
  const prescription = unmarshall(prescriptionImage) as Prescription;
  const { id: prescriptionId, prescriptionNumber, status: prescriptionStatus, patientId } = prescription;

  const { data: patient, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patient) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
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