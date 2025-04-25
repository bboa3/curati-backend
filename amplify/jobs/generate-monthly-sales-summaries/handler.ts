import { env } from '$amplify/env/generate-monthly-sales-summaries';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Logger } from '@aws-lambda-powertools/logger';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { EventBridgeHandler } from "aws-lambda";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import { Business, PublicationStatus, SalesSummaryTimeGranularity } from '../../functions/helpers/types/schema';
import { generateBusinessPerformanceSummaries } from '../helpers/generate-business-performance-summaries';
import { generateDriverPerformanceSummaries } from '../helpers/generate-driver-performance-summaries';
import { generateMedicineSalesSummaries } from '../helpers/generate-medicine-sales-summaries';
import { generateServicePerformanceSummaries } from '../helpers/generate-service-performance-summaries';
import { getPeriodDates } from '../helpers/getPeriodDates';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(duration);

const commissionPercentage = Number(env.DRIVER_COMMISSION_PERCENTAGE);

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

const client = generateClient<any>();

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (_event) => {
  const timeGranularity = SalesSummaryTimeGranularity.MONTHLY;
  const now = dayjs().utc();
  logger.info(`Generating sales summaries for ${timeGranularity} granularity at ${now.toISOString()}`);

  try {
    const { data: businessesData, errors: businessesErrors } = await client.models.business.list({
      filter: { publicationStatus: { eq: PublicationStatus.PUBLISHED } },
      limit: 2000
    });

    if (businessesErrors || !businessesData) {
      throw new Error(`Failed to fetch businesses: ${JSON.stringify(businessesErrors)}`);
    }
    const businesses = businessesData as Business[];

    logger.info(`Found ${businesses.length} businesses`);

    for (const business of businesses) {
      const { start, end } = getPeriodDates(timeGranularity, now);

      await generateMedicineSalesSummaries({
        businessId: business.id,
        periodStart: start,
        periodEnd: end,
        dbClient: client,
        timeGranularity,
        logger
      });

      await generateDriverPerformanceSummaries({
        businessId: business.id,
        periodStart: start,
        periodEnd: end,
        dbClient: client,
        timeGranularity,
        commissionPercentage,
        logger
      });

      await generateServicePerformanceSummaries({
        businessId: business.id,
        periodStart: start,
        periodEnd: end,
        dbClient: client,
        timeGranularity,
        logger
      });

      await generateBusinessPerformanceSummaries({
        businessId: business.id,
        periodStart: start,
        periodEnd: end,
        dbClient: client,
        timeGranularity,
        logger
      })

      logger.info(`Generated sales summaries for business ${business.id}`);
    }
  } catch (error) {
    logger.error("Error generating sales summaries", { error });
  }
};