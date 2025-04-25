import { Dayjs } from "dayjs";
import { SalesSummaryTimeGranularity } from "../../functions/helpers/types/schema";

export const getPeriodDates = (granularity: SalesSummaryTimeGranularity, date: Dayjs) => {
  switch (granularity) {
    case SalesSummaryTimeGranularity.DAILY:
      return {
        start: date.startOf('day'),
        end: date.endOf('day')
      };
    case SalesSummaryTimeGranularity.WEEKLY:
      return {
        start: date.startOf('week'),
        end: date.endOf('week')
      };
    case SalesSummaryTimeGranularity.MONTHLY:
      return {
        start: date.startOf('month'),
        end: date.endOf('month')
      };
    case SalesSummaryTimeGranularity.YEARLY:
      return {
        start: date.startOf('year'),
        end: date.endOf('year')
      };
    default:
      throw new Error('Invalid time granularity');
  }
};
