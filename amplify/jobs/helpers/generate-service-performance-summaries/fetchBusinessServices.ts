import { Logger } from "@aws-lambda-powertools/logger";
import { BusinessService, PublicationStatus } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string,
  dbClient: any,
  logger: Logger
}

export const fetchBusinessServices = async ({ businessId, dbClient, logger }: TriggerInput) => {
  const { data, errors } = await dbClient.models.businessService.list({
    filter: {
      businessId: { eq: businessId },
      publicationStatus: { eq: PublicationStatus.PUBLISHED }
    }
  });

  if (errors) throw new Error(`Failed to fetch services: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} services`);

  return data as BusinessService[] || [];
};