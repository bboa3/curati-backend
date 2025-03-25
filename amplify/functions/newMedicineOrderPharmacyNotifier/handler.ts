import { Logger } from "@aws-lambda-powertools/logger";
import { DynamoDBClient, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { Schema } from '../../data/resource';
import { sendOrderNotificationEmail } from './utils/send-email';

type Delivery = Schema['delivery']['type'];
type Pharmacist = Schema['professional']['type'];
type MedicineOrder = Schema['medicineOrder']['type'];

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const dbClient = new DynamoDBClient({});

async function getPharmacists(pharmacyId: string): Promise<Pharmacist[]> {
  const params = {
    TableName: "professional",
    KeyConditionExpression: "businessId = :businessId",
    ExpressionAttributeValues: marshall({ ":businessId": pharmacyId }),
  };
  try {
    const { Items } = await dbClient.send(new QueryCommand(params));
    return Items ? Items.map((item) => unmarshall(item)) as Pharmacist[] : [];
  } catch (error) {
    logger.error(`Error getting Pharmacists: ${error}`);
    throw error;
  }
}

async function getMedicineOrder(id: string): Promise<MedicineOrder | null> {
  const params = {
    TableName: "medicineOrder",
    Key: marshall({ id }),
  };
  try {
    const { Item } = await dbClient.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) as MedicineOrder : null;
  } catch (error) {
    logger.error(`Error getting Business data: ${error}`);
    throw error;
  }
}

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    logger.info(`Processing record: ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      const delivery = record.dynamodb?.NewImage as unknown as Delivery;
      if (!delivery) throw new Error("Delivery not found");

      const order = await getMedicineOrder(delivery.orderId)

      const pharmacists = await getPharmacists(delivery.pharmacyId);
      if (!order || !pharmacists) throw Error('Order or pharmacists not found')

      const toAddresses = pharmacists.map((pharmacist) => pharmacist.email);

      const data = await sendOrderNotificationEmail(toAddresses, order.orderNumber)

      logger.info("Email sent successfully!", { messageId: data.MessageId, recipients: toAddresses });
      logger.info(`New Image: ${JSON.stringify(record.dynamodb?.NewImage)}`);
    }
  }
  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};
