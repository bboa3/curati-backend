import dayjs from "dayjs";

interface CheckOnTimeDeliveryInput {
  startWindow: string;
  endWindow: string;
  deliveredAt?: string;
}

export const checkOnTimeDelivery = ({ startWindow, endWindow, deliveredAt }: CheckOnTimeDeliveryInput): boolean => {
  if (!deliveredAt) return false;
  return dayjs(deliveredAt).isBetween(startWindow, endWindow);
};