import { env } from '$amplify/env/delivery-stream-watcher';

const commissionPercentage = Number(env.DRIVER_COMMISSION_PERCENTAGE);

export const driverCommissionCalculator = (totalDeliveryFee: number): number => {
  return totalDeliveryFee * commissionPercentage;;
};