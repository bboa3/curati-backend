import { DeliveryStatus } from "../../helpers/types/schema";

const DELIVERY_STATUS_DESCRIPTIONS = new Map<DeliveryStatus, string>([
  [DeliveryStatus.PENDING, 'Pedido recebido'],
  [DeliveryStatus.PHARMACY_PREPARING, 'Preparando para entrega'],
  [DeliveryStatus.AWAITING_DRIVER_ASSIGNMENT, 'Aguardando motorista'],
  [DeliveryStatus.DRIVER_ASSIGNED, 'Motorista designado'],
  [DeliveryStatus.PICKED_UP_BY_DRIVER, 'Coletado pelo motorista'],
  [DeliveryStatus.IN_TRANSIT, 'Em transito'],
  [DeliveryStatus.DELIVERED, 'Entregue'],
  [DeliveryStatus.AWAITING_PATIENT_PICKUP, 'Aguardando coleta do cliente'],
  [DeliveryStatus.PICKED_UP_BY_PATIENT, 'Coletado pelo cliente'],
  [DeliveryStatus.CANCELLED, 'Cancelado'],
  [DeliveryStatus.FAILED, 'Falhou'],
]);
export const convertDeliveryStatus = (type: DeliveryStatus): string => {
  return DELIVERY_STATUS_DESCRIPTIONS.get(type) || '';
};
