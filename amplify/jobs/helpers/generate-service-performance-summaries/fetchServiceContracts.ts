import { Logger } from '@aws-lambda-powertools/logger';
import { Dayjs } from 'dayjs';
import { Contract, ContractStatus } from '../../../functions/helpers/types/schema';

interface TriggerInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
  logger: Logger;
}

export const fetchServiceContracts = async ({
  businessId,
  periodStart,
  periodEnd,
  dbClient,
  logger
}: TriggerInput): Promise<Contract[]> => {
  const { data, errors } = await dbClient.models.contract.list({
    filter: {
      businessId: { eq: businessId },
      status: { eq: ContractStatus.ACTIVE },
      nextRenewalDate: { between: [periodStart.toISOString(), periodEnd.toISOString()] }
    }
  });

  if (errors) throw new Error(`Failed to fetch service contracts: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} active contracts`);
  return data as Contract[];
};