import { ContractStatus } from "../../helpers/types/schema";

const CONTRACT_STATUS_DESCRIPTIONS = new Map<ContractStatus, string>([
  [ContractStatus.PENDING_CONFIRMATION, 'Aguardando confirmação'],
  [ContractStatus.PENDING_PAYMENT, 'Aguardando pagamento'],
  [ContractStatus.ACTIVE, 'Ativa'],
  [ContractStatus.EXPIRED, 'Expirada'],
  [ContractStatus.TERMINATED, 'Cancelada'],
  [ContractStatus.REJECTED, 'Rejeitada'],
]);

export const convertContractStatus = (type: ContractStatus): string => {
  return CONTRACT_STATUS_DESCRIPTIONS.get(type) || '';
};
