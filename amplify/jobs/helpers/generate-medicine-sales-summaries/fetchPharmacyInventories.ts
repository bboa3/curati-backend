import { Logger } from "@aws-lambda-powertools/logger";
import { PharmacyInventory, PublicationStatus } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string,
  dbClient: any,
  logger: Logger
}

export const fetchPharmacyInventories = async ({ businessId, dbClient, logger }: TriggerInput) => {
  const { data, errors } = await dbClient.models.pharmacyInventory.list({
    filter: {
      pharmacyId: { eq: businessId },
      publicationStatus: { eq: PublicationStatus.PUBLISHED }
    }
  });

  if (errors) throw new Error(`Failed to fetch inventories: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} inventories`);

  return data as PharmacyInventory[] || [];
};