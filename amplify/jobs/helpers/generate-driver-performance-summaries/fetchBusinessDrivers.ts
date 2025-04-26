import { Logger } from "@aws-lambda-powertools/logger";
import { Professional, ProfessionalType, PublicationStatus } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string,
  dbClient: any,
  logger: Logger
}

export const fetchBusinessDrivers = async ({ businessId, dbClient, logger }: TriggerInput) => {
  const { data, errors } = await dbClient.models.professional.list({
    filter: {
      businessId: { eq: businessId },
      type: { eq: ProfessionalType.DRIVER },
      publicationStatus: { eq: PublicationStatus.PUBLISHED }
    }
  });

  if (errors) throw new Error(`Failed to fetch drivers: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} drivers`);

  return data as Professional[] || [];
};