import { RatedItemType, Rating } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "../paginatedQuery";

export const collectReputationMetrics = async (params: {
  dbClient: any;
  driverId: string;
}) => {
  const ratings: Rating[] = await paginatedQuery(params.dbClient.models.rating, {
    filter: {
      ratedItemType: { eq: RatedItemType.PROFESSIONAL },
      ratedItemId: { eq: params.driverId }
    }
  });

  if (ratings.length === 0) return { averageRating: 0, reviewsCount: 0 };

  const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
  return {
    averageRating: parseFloat((totalRating / ratings.length).toFixed(2)),
    reviewsCount: ratings.length
  };
};