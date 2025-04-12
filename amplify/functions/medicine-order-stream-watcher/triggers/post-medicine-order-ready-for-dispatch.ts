import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "aws-lambda";
import { MedicineOrder } from "../../helpers/types/schema";
import { updatePrescriptionRefillsRemaining } from "../helpers/update-prescription-refills-remaining";

interface TriggerInput {
  medicineOrderImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postMedicineOrderReadyForDispatch = async ({ medicineOrderImage, dbClient }: TriggerInput) => {
  const order = unmarshall(medicineOrderImage) as MedicineOrder;
  const { id: prescriptionId } = order;

  if (prescriptionId) {
    await updatePrescriptionRefillsRemaining({
      client: dbClient,
      prescriptionId: prescriptionId
    })
  }
};