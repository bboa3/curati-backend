import dayjs from 'dayjs';
import { Business, PublicationStatus, SalesSummaryItemType, SalesSummaryTimeGranularity } from '../../../functions/helpers/types/schema';
import { aggregateDeliveryFees } from './aggregateDeliveryFees';
import { aggregateMedicineSales } from './aggregateMedicineSales';
import { aggregateServiceSales } from './aggregateServiceSales';
import { getPeriodDates } from './getPeriodDates';

interface GenerateSalesSummariesInput {
  granularity: SalesSummaryTimeGranularity
  dbClient: any
}

export const generateSalesSummaries = async ({ granularity, dbClient }: GenerateSalesSummariesInput) => {
  const now = dayjs.utc();
  try {
    const { data: businessesData, errors: businessesErrors } = await dbClient.models.business.list({
      filter: { publicationStatus: { eq: PublicationStatus.PUBLISHED } }
    });

    if (businessesErrors || !businessesData) throw new Error(JSON.stringify(businessesErrors || businessesData));
    const businesses = businessesData as Business[];

    for (const business of businesses) {
      const { start, end } = getPeriodDates(granularity, now);

      const medicineSales = await aggregateMedicineSales({
        businessId: business.id,
        periodStart: start,
        periodEnd: end,
        dbClient: dbClient
      });

      if (medicineSales) {
        for (const [itemId, data] of medicineSales) {
          await dbClient.models.salesSummary.create({
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
        dbClient: dbClient
      });

      if (serviceSales) {
        for (const [itemId, data] of serviceSales) {
          await dbClient.models.salesSummary.create({
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
        dbClient: dbClient
      });

      if (deliverySales) {
        for (const [itemId, data] of deliverySales) {
          await dbClient.models.salesSummary.create({
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
  } catch (error) {
    console.error('Error generating sales summaries:', error);
  }
};