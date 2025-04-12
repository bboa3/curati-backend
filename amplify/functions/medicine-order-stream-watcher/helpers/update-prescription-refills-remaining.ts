import { Schema } from "../../../data/resource";

interface UpdateInventoriesInput {
  client: any;
  prescriptionId: string;
}
type Prescription = Schema['prescription']['type'];

export const updatePrescriptionRefillsRemaining = async ({ client, prescriptionId }: UpdateInventoriesInput) => {
  const { data: prescriptionData, errors: prescriptionErrors } = await client.models.prescription.get({ id: prescriptionId });

  if (prescriptionErrors || !prescriptionData) {
    throw new Error(`Failed to fetch prescription: ${JSON.stringify(prescriptionErrors)}`);
  }
  const prescription = prescriptionData as Prescription;

  const { errors } = await client.models.prescription.update({
    id: prescription.id,
    refillsRemaining: prescription.refillsRemaining - 1,
  });

  if (errors) {
    throw new Error(`Failed to update prescription: ${JSON.stringify(errors)}`);
  }
}