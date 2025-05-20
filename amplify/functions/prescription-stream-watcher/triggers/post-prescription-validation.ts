import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Prescription } from '../../helpers/types/schema';
import { createPrescriptionValidatedNotification } from "../helpers/create-prescription-validated-notification";

interface TriggerInput {
  prescriptionImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postPrescriptionValidation = async ({ prescriptionImage, dbClient }: TriggerInput) => {
  const prescription = unmarshall(prescriptionImage as any) as Prescription;
  const { patientId } = prescription;

  const { data: patient, errors: patientErrors } = await dbClient.models.patient.get({ userId: patientId });

  if (patientErrors || !patient) {
    throw new Error(`Failed to fetch patient: ${JSON.stringify(patientErrors)}`);
  }

  await createPrescriptionValidatedNotification({
    dbClient,
    patient,
    prescription
  });
};