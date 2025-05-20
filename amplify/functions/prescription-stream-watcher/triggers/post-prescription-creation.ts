import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { Prescription, User, UserRole } from '../../helpers/types/schema';
import { createPrescriptionCreatedNotification } from "../helpers/create-prescription-created-notification";

interface TriggerInput {
  prescriptionImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postPrescriptionCreation = async ({ prescriptionImage, dbClient }: TriggerInput) => {
  const prescription = unmarshall(prescriptionImage as any) as Prescription;

  const { data: adminsData, errors: adminErrors } = await dbClient.models.user.list({
    filter: { role: { eq: UserRole.ADMIN } }
  });

  if (adminErrors || !adminsData || adminsData.length === 0) {
    throw new Error(`Failed to fetch admins: ${JSON.stringify(adminErrors)}`);
  }
  const admins = adminsData as User[];

  await createPrescriptionCreatedNotification({
    dbClient,
    admins,
    prescription
  });
};