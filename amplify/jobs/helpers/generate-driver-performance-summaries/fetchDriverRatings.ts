import { Logger } from "@aws-lambda-powertools/logger";
import { Rating } from "../../../functions/helpers/types/schema";
import { RatingMetrics } from "./initializeMetrics";

interface TriggerInput {
  driverIds: string[],
  dbClient: any,
  logger: Logger
}

export const fetchDriverRatings = async ({ driverIds, dbClient, logger }: TriggerInput): Promise<Map<string, RatingMetrics>> => {
  if (driverIds.length === 0) return new Map();
  const ratingsMap = new Map<string, RatingMetrics>();
  let nextToken: string | null = null;

  const batchSize = 100;
  for (let i = 0; i < driverIds.length; i += batchSize) {
    const batch = driverIds.slice(i, i + batchSize);

    do {
      const { data: chunk, errors, nextToken: newNextToken } = await dbClient.models.rating.list({
        filter: {
          or: batch.map(id => ({ ratedItemId: { eq: id } })),
        },
        limit: 1000,
        nextToken,
      }) as any;

      if (errors) throw new Error(`Rating fetch error: ${JSON.stringify(errors)}`);

      chunk.forEach((rating: Rating) => {
        const existing = ratingsMap.get(rating.ratedItemId) || { ratingSum: 0, ratingCount: 0 };
        ratingsMap.set(rating.ratedItemId, {
          ratingSum: existing.ratingSum + rating.rating,
          ratingCount: existing.ratingCount + 1
        });
      });

      nextToken = newNextToken;
    } while (nextToken);
  }

  logger.info(`Processed ratings for ${ratingsMap.size} drivers`);
  return ratingsMap;
};