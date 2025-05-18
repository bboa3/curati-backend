import { DeliveryType } from "../../../helpers/types/schema";

const DeliveryType_DESCRIPTIONS = new Map<DeliveryType, string>([
  [DeliveryType.PICKUP, 'Recolha'],
  [DeliveryType.DELIVERY, 'Entrega'],
]);

export const convertDeliveryType = (type: DeliveryType): string => {
  return DeliveryType_DESCRIPTIONS.get(type) || '';
};
