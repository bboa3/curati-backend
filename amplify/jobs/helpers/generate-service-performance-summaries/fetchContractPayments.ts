import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { Contract, ContractPayment } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  contracts: Contract[];
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
  logger: Logger;
}

export const fetchContractPayments = async ({
  contracts,
  periodStart,
  periodEnd,
  dbClient,
  logger
}: TriggerInput): Promise<ContractPayment[]> => {
  const contractIds = contracts.map(c => c.id);
  const payments: ContractPayment[] = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < contractIds.length; i += BATCH_SIZE) {
    const batch = contractIds.slice(i, i + BATCH_SIZE);
    let nextToken: string | null = null;

    do {
      const { data, errors, nextToken: newNextToken } = await dbClient.models.contractPayment.list({
        filter: {
          and: [
            { or: batch.map(id => ({ contractId: { eq: id } })) },
            { paymentDate: { between: [periodStart.toISOString(), periodEnd.toISOString()] } }
          ]
        },
        limit: 1000,
        nextToken,
      }) as any;

      if (errors) throw new Error(`Contract payment fetch error: ${JSON.stringify(errors)}`);
      payments.push(...(data as ContractPayment[]));
      nextToken = newNextToken;
    } while (nextToken);
  }

  logger.info(`Processed ${contractIds.length} contracts in ${Math.ceil(contractIds.length / BATCH_SIZE)} batches, found ${payments.length} payments`);
  return payments;
};
