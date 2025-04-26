import { Logger } from "@aws-lambda-powertools/logger";
import { BusinessServicePricing } from "../../../functions/helpers/types/schema";

interface AggregatorInput {
  businessServiceId: string;
  dbClient: any;
  logger: Logger;
}

export const fetchBusinessServicePricing = async ({
  businessServiceId,
  dbClient,
  logger
}: AggregatorInput): Promise<BusinessServicePricing[]> => {
  const { data, errors } = await dbClient.models.businessServicePricing.list({
    filter: { businessServiceId: { eq: businessServiceId } },
  });

  if (errors) throw new Error(`Pricing fetch failed: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} pricing records`);

  return data as BusinessServicePricing[];
};