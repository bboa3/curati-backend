export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
};

export const calculateAveragePrice = (totalRevenue: number, totalUnits: number): number => {
  return totalUnits > 0 ? parseFloat((totalRevenue / totalUnits).toFixed(2)) : 0;
};