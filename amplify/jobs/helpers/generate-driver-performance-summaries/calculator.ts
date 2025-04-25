import dayjs from "dayjs";
import { Delivery } from "../../../functions/helpers/types/schema";

export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
};

export const calculateAverage = (total: number, count: number): number => {
  return count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
};

export const calculatePercentage = (numerator: number, denominator: number): number => {
  return denominator > 0 ? parseFloat((numerator / denominator * 100).toFixed(2)) : 0;
};

export const calculateDeliveryDuration = (pickedUpAt?: string, deliveredAt?: string): number => {
  if (!pickedUpAt || !deliveredAt) return 0;
  const start = dayjs.utc(pickedUpAt);
  const end = dayjs.utc(deliveredAt);
  return end.diff(start, 'minute');
};

export const calculateCommission = (delivery: Delivery, commissionPercentage: number): number => {
  return (delivery.totalDeliveryFee || 0) * commissionPercentage;
};