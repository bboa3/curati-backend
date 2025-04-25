import { Logger } from "@aws-lambda-powertools/logger";
import { BusinessServicePricing } from "../../../functions/helpers/types/schema";

interface AggregatorInput {
  businessServiceIds: string[];
  dbClient: any;
  logger: Logger;
}

export const fetchBusinessServicePricing = async ({
  businessServiceIds,
  dbClient,
  logger
}: AggregatorInput): Promise<BusinessServicePricing[]> => {
  const pricing: BusinessServicePricing[] = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < businessServiceIds.length; i += BATCH_SIZE) {
    const batch = businessServiceIds.slice(i, i + BATCH_SIZE);
    let nextToken = null;

    do {
      const { data, errors, nextToken: newToken } = await dbClient.models.businessServicePricing.list({
        filter: { or: batch.map(id => ({ businessServiceId: { eq: id } })) },
        limit: 1000,
        nextToken
      }) as any;

      if (errors) throw new Error(`Pricing fetch failed: ${JSON.stringify(errors)}`);
      pricing.push(...data);
      nextToken = newToken;
    } while (nextToken);
  }

  logger.info(`Fetched ${pricing.length} pricing records for ${businessServiceIds.length} services`);
  return pricing;
};