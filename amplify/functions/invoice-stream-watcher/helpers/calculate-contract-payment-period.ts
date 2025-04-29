import dayjs from "dayjs";
import { ContractPayment, ContractType } from "../../helpers/types/schema";

interface PaymentPeriod {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}

interface CalculatorInput {
  contractType: ContractType;
  contractId: string;
  dbClient: any;
}

export const calculateContractPaymentPeriod = async ({ contractId, contractType, dbClient }: CalculatorInput): Promise<PaymentPeriod> => {
  const now = dayjs.utc();

  if (contractType === ContractType.ONE_TIME) {
    return { start: now, end: now };
  }

  const { data: payments } = await dbClient.models.contractPayment.list({
    filter: { contractId: { eq: contractId } },
    limit: 1,
    sortDirection: 'DESC',
  });

  const lastPayment = payments?.[0] as ContractPayment | undefined;

  const lastPeriodEnd = lastPayment?.periodEnd ? dayjs.utc(lastPayment.periodEnd) : null;

  const periodStart = lastPeriodEnd?.isAfter(now) ? lastPeriodEnd : now;

  const periodEnd = contractType === ContractType.MONTHLY ?
    periodStart.add(1, 'month') :
    periodStart.add(1, 'year');

  return { start: periodStart, end: periodEnd };
};