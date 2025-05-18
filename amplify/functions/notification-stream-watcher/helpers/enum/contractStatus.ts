import { ContractStatus } from "../../../helpers/types/schema";

const CONTRACT_STATUS_DESCRIPTIONS = new Map<ContractStatus, string>([
  [ContractStatus.PENDING_PAYMENT, 'Pagamento pendente'],
  [ContractStatus.PENDING_CONFIRMATION, 'Confirmação pendente'],
  [ContractStatus.ACTIVE, 'Ativo'],
  [ContractStatus.EXPIRED, 'Expirado'],
  [ContractStatus.TERMINATED, 'Terminado'],
  [ContractStatus.REJECTED, 'Rejeitado'],
]);

export const convertContractStatus = (type: ContractStatus): string => {
  return CONTRACT_STATUS_DESCRIPTIONS.get(type) || '';
};
