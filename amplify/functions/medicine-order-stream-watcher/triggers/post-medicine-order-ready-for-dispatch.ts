import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Professional } from "../../helpers/types/schema";
import { updatePrescriptionRefillsRemaining } from "../helpers/update-prescription-refills-remaining";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderReadyForDispatch = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const orderId = medicineOrderImage?.id?.S;
  const orderNumber = medicineOrderImage?.orderNumber?.S;
  const pharmacyId = medicineOrderImage?.businessId?.S;
  const patientId = medicineOrderImage?.patientId?.S;
  const prescriptionId = medicineOrderImage?.prescriptionId?.S;

  if (!orderId || !orderNumber || !pharmacyId || !patientId) {
    throw new Error("Missing required order fields");
  }

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    throw new Error(`Failed to fetch pharmacy: ${JSON.stringify(pharmacyErrors)}`);
  }
  const pharmacy = pharmacyData as unknown as Professional



  if (prescriptionId) {
    await updatePrescriptionRefillsRemaining({
      client: dbClient,
      prescriptionId: prescriptionId
    })
  }
};