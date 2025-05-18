import { MedicineOrderStatus } from "../../../helpers/types/schema";

const MEDICINE_ORDER_STATUS_DESCRIPTIONS = new Map<MedicineOrderStatus, string>([
  [MedicineOrderStatus.PENDING_PAYMENT, 'Pagamento pendente'],
  [MedicineOrderStatus.PHARMACY_REVIEW, 'Em revisão'],
  [MedicineOrderStatus.PROCESSING, 'Em processamento'],
  [MedicineOrderStatus.READY_FOR_DISPATCH, 'Pronto para entrega'],
  [MedicineOrderStatus.DISPATCHED, 'Entregue'],
  [MedicineOrderStatus.COMPLETED, 'Finalizado'],
  [MedicineOrderStatus.REJECTED, 'Rejeitado'],
  [MedicineOrderStatus.CANCELED, 'Cancelado'],
]);

export const convertMedicineOrderStatus = (type: MedicineOrderStatus): string => {
  return MEDICINE_ORDER_STATUS_DESCRIPTIONS.get(type) || '';
};
