import { env } from '$amplify/env/generate-daily-sales-summaries';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { EventBridgeHandler } from "aws-lambda";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { SalesSummaryTimeGranularity } from '../../functions/helpers/types/schema';
import { generateSalesSummaries } from '../helpers/generate-sales-summaries';

dayjs.extend(utc);

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<any>();

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (_event) => {
  return await generateSalesSummaries({
    granularity: SalesSummaryTimeGranularity.DAILY,
    dbClient: client
  })
};