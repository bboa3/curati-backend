
const calculateWeightedMetric = (
  existingCount: number,
  existingValue: number,
  newCount: number,
  newValue: number
): number => {
  const total = existingCount + newCount;
  return total > 0
    ? parseFloat(((existingCount * existingValue + newCount * newValue) / total).toFixed(2))
    : 0;
};
