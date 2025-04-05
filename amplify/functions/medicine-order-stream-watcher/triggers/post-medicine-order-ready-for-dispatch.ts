import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { Professional } from "../../helpers/types/schema";
import { updatePrescriptionRefillsRemaining } from "../helpers/update-prescription-refills-remaining";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderReadyForDispatch = async ({ medicineOrderImage, dbClient, logger }: TriggerInput) => {
  const orderId = medicineOrderImage?.id?.S;
  const orderNumber = medicineOrderImage?.orderNumber?.S;
  const pharmacyId = medicineOrderImage?.businessId?.S;
  const patientId = medicineOrderImage?.patientId?.S;
  const prescriptionId = medicineOrderImage?.prescriptionId?.S;

  if (!orderId || !orderNumber || !pharmacyId || !patientId) {
    logger.warn("Missing required order fields");
    return;
  }

  const { data: pharmacyData, errors: pharmacyErrors } = await dbClient.models.business.get({ id: pharmacyId });

  if (pharmacyErrors || !pharmacyData) {
    logger.error("Failed to fetch pharmacy", { errors: pharmacyErrors });
    return;
  }
  const pharmacy = pharmacyData as unknown as Professional



  if (prescriptionId) {
    await updatePrescriptionRefillsRemaining({
      client: dbClient,
      logger,
      prescriptionId: prescriptionId
    })
  }


};