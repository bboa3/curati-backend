import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../functions/helpers/types/schema";

interface TriggerInput {
  periodStart: Dayjs;
  periodEnd: Dayjs;
  timeGranularity: SalesSummaryTimeGranularity;
}

export const getPreviousPeriodDates = ({ periodStart, periodEnd, timeGranularity }: TriggerInput) => {
  const dateUnit = timeGranularity === SalesSummaryTimeGranularity.DAILY ? 'day' :
    timeGranularity === SalesSummaryTimeGranularity.WEEKLY ? 'week' :
      timeGranularity === SalesSummaryTimeGranularity.MONTHLY ? 'month' :
        'year';

  return {
    previousPeriodStart: periodStart.subtract(1, dateUnit),
    previousPeriodEnd: periodEnd.subtract(1, dateUnit)
  };
};