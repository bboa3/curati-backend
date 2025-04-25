import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { MedicineOrder, MedicineOrderStatus } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
  logger: Logger;
}

export const fetchCompletedOrders = async ({ businessId, periodStart, periodEnd, dbClient, logger }: TriggerInput): Promise<MedicineOrder[]> => {
  const { data, errors } = await dbClient.models.medicineOrder.list({
    filter: {
      businessId: { eq: businessId },
      status: { eq: MedicineOrderStatus.COMPLETED },
      createdAt: { between: [periodStart.toISOString(), periodEnd.toISOString()] }
    }
  });

  if (errors) throw new Error(`Failed to fetch orders: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} orders from ${periodStart.format('YYYY-MM-DD')} to ${periodEnd.format('YYYY-MM-DD')}`);

  return data as MedicineOrder[];
};
