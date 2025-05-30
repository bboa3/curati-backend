import { RatedItemType, Rating } from "../../../functions/helpers/types/schema";
import { paginatedQuery } from "../paginatedQuery";

export const collectReputationMetrics = async (params: {
  dbClient: any;
  businessId: string;
}) => {
  const ratings: Rating[] = await paginatedQuery(params.dbClient.models.rating, {
    filter: {
      ratedItemType: { eq: RatedItemType.BUSINESS },
      ratedItemId: { eq: params.businessId }
    }
  });

  if (ratings.length === 0) return { averageRating: 0, reviewsCount: 0 };

  const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
  return {
    averageRating: parseFloat((totalRating / ratings.length).toFixed(2)),
    reviewsCount: ratings.length
  };
};