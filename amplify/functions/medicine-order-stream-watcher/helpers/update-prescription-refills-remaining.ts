import { Logger } from "@aws-lambda-powertools/logger";
import { Schema } from "../../../data/resource";

interface UpdateInventoriesInput {
  client: any;
  logger: Logger;
  prescriptionId: string;
}
type Prescription = Schema['prescription']['type'];

export const updatePrescriptionRefillsRemaining = async ({ client, logger, prescriptionId }: UpdateInventoriesInput) => {
  const { data: prescriptionData, errors: prescriptionErrors } = await client.models.prescription.get({ id: prescriptionId });

  if (prescriptionErrors || !prescriptionData) {
    logger.error("Failed to fetch prescription", { errors: prescriptionErrors });
    return;
  }
  const prescription = prescriptionData as Prescription;

  const { errors } = await client.models.prescription.update({
    id: prescription.id,
    refillsRemaining: prescription.refillsRemaining - 1,
  });

  if (errors) {
    logger.error(`Failed to update prescription remaining refills`, { errors });
    return;
  }
}