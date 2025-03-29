import { env } from '$amplify/env/medicine-order-stream-watcher';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { EventBridgeHandler } from "aws-lambda";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Business, PublicationStatus, SalesSummaryItemType, SalesSummaryTimeGranularity } from '../../functions/helpers/types/schema';
import { aggregateDeliveryFees } from './helpers/aggregateDeliveryFees';
import { aggregateMedicineSales } from './helpers/aggregateMedicineSales';
import { aggregateServiceSales } from './helpers/aggregateServiceSales';
import { getPeriodDates } from './helpers/getPeriodDates';

dayjs.extend(utc);

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<any>();

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (_event) => {
  const now = dayjs.utc();

  const granularities = [
    SalesSummaryTimeGranularity.DAILY,
    SalesSummaryTimeGranularity.MONTHLY
  ];

  try {
    const { data: businessesData, errors: businessesErrors } = await client.models.business.list({
      filter: { publicationStatus: { eq: PublicationStatus.PUBLISHED } }
    });

    if (businessesErrors || !businessesData) throw new Error(JSON.stringify(businessesErrors || businessesData));
    const businesses = businessesData as Business[];

    for (const business of businesses) {
      for (const granularity of granularities) {
        const { start, end } = getPeriodDates(granularity, now);

        const medicineSales = await aggregateMedicineSales({
          businessId: business.id,
          periodStart: start,
          periodEnd: end,
          dbClient: client
        });

        if (medicineSales) {
          for (const [itemId, data] of medicineSales) {
            await client.models.salesSummary.create({
              businessId: business.id,
              itemId,
              itemType: SalesSummaryItemType.MEDICINE,
              timeGranularity: granularity,
              periodStart: start.toISOString(),
              periodEnd: end.toISOString(),
              totalRevenue: data.totalRevenue,
              totalUnitsSold: data.totalUnits,
              numberOfSales: data.count,
              averageUnitPrice: data.totalRevenue / data.totalUnits
            });
          }
        }


        const serviceSales = await aggregateServiceSales({
          businessId: business.id,
          periodStart: start,
          periodEnd: end,
          dbClient: client
        });

        if (serviceSales) {
          for (const [itemId, data] of serviceSales) {
            await client.models.salesSummary.create({
              businessId: business.id,
              itemId,
              itemType: SalesSummaryItemType.BUSINESSSERVICE,
              timeGranularity: granularity,
              periodStart: start.toISOString(),
              periodEnd: end.toISOString(),
              totalRevenue: data.totalRevenue,
              numberOfSales: data.count,
              totalUnitsSold: data.count,
              averageUnitPrice: data.totalRevenue / data.count
            });
          }
        }


        const deliverySales = await aggregateDeliveryFees({
          businessId: business.id,
          periodStart: start,
          periodEnd: end,
          dbClient: client
        });

        if (deliverySales) {
          for (const [itemId, data] of deliverySales) {
            await client.models.salesSummary.create({
              businessId: business.id,
              itemId,
              itemType: SalesSummaryItemType.DRIVER,
              timeGranularity: granularity,
              periodStart: start.toISOString(),
              periodEnd: end.toISOString(),
              totalRevenue: data.totalRevenue,
              numberOfSales: data.count,
              totalUnitsSold: data.totalUnits,
              averageUnitPrice: data.averageFee
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating sales summaries:', error);
  }
};