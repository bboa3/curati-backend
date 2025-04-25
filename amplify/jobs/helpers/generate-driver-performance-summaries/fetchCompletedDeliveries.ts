import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { Delivery, DeliveryStatus } from "../../../functions/helpers/types/schema";

interface TriggerInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
  logger: Logger;
}

export const fetchCompletedDeliveries = async ({ businessId, periodStart, periodEnd, dbClient, logger }: TriggerInput): Promise<Delivery[]> => {
  const { data, errors } = await dbClient.models.delivery.list({
    filter: {
      courierId: { eq: businessId },
      status: { eq: DeliveryStatus.DELIVERED },
      deliveredAt: { between: [periodStart.toISOString(), periodEnd.toISOString()] },
    }
  });

  if (errors) throw new Error(`Failed to fetch deliveries: ${JSON.stringify(errors)}`);
  logger.info(`Found ${data.length} completed deliveries`);

  return data as Delivery[];
};
