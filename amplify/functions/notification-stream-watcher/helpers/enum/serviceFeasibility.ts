import { ServiceFeasibility } from "../../../helpers/types/schema";

const SERVICE_FEASIBILITY_DESCRIPTIONS = new Map<ServiceFeasibility, string>([
  [ServiceFeasibility.LOW, 'Baixa'],
  [ServiceFeasibility.MEDIUM, 'Média'],
  [ServiceFeasibility.HIGH, 'Alta'],
]);

export const convertServiceFeasibility = (feasibility: ServiceFeasibility): string => {
  return SERVICE_FEASIBILITY_DESCRIPTIONS.get(feasibility) || '';
};
