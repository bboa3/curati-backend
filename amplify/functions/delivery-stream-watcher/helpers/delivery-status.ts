import { DeliveryStatus } from "../../helpers/types/schema";

const DELIVERY_STATUS_DESCRIPTIONS = new Map<DeliveryStatus, string>([
  [DeliveryStatus.PHARMACY_PREPARING, 'Preparando para entrega'],
  [DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT, 'Aguardando motorista'],
  [DeliveryStatus.DRIVER_ASSIGNED, 'Motorista adicionado'],
  [DeliveryStatus.IN_TRANSIT, 'Em transito'],
  [DeliveryStatus.DELIVERED, 'Entregue'],
  [DeliveryStatus.AWAITING_PATIENT_PICKUP, 'Aguardando retirada do cliente'],
  [DeliveryStatus.PICKED_UP_BY_PATIENT, 'Retirada pelo cliente'],
  [DeliveryStatus.CANCELLED, 'Cancelado'],
  [DeliveryStatus.FAILED, 'Falhou'],
]);

export const convertDeliveryStatus = (type: DeliveryStatus): string => {
  return DELIVERY_STATUS_DESCRIPTIONS.get(type) || '';
};
