import { ContractType } from "../../../helpers/types/schema";

const CONTRACT_TYPE_DESCRIPTIONS = new Map<ContractType, string>([
  [ContractType.ONE_TIME, 'Consulta Única'],
  [ContractType.MONTHLY, 'Mensal'],
  [ContractType.ANNUALLY, 'Anual'],
]);

export const convertContractType = (type: ContractType): string => {
  return CONTRACT_TYPE_DESCRIPTIONS.get(type) || '';
};
