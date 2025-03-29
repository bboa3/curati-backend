import { Dayjs } from "dayjs";
import { BusinessService, BusinessServicePricing, ConsultationRecord } from "../../../functions/helpers/types/schema";

interface AggregatorInput {
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
  dbClient: any;
}

export const aggregateServiceSales = async ({ businessId, periodStart, periodEnd, dbClient }: AggregatorInput) => {
  const { data: consultationsData, errors: consultationsErrors } = await dbClient.models.consultationRecord.list({
    filter: {
      businessId: { eq: businessId },
      createdAt: {
        between: [periodStart.toISOString(), periodEnd.toISOString()]
      }
    }
  });

  if (!consultationsData || consultationsData.length === 0) return null;

  if (consultationsErrors) throw new Error(JSON.stringify(consultationsErrors));
  const consultations = consultationsData as ConsultationRecord[];

  const serviceIds = [...new Set(consultations.map(c => c.businessServiceId))];
  const serviceFilter = { or: serviceIds.map(id => ({ id: { eq: id } })) };
  const { data: servicesData, errors: servicesErrors } = await dbClient.models.businessService.list({ filter: serviceFilter });
  if (servicesErrors) throw new Error(JSON.stringify(servicesErrors));

  const services = servicesData as BusinessService[];
  const serviceMap = new Map(services.map(s => [s.id, s]));

  const pricingFilter = { or: serviceIds.map(id => ({ businessServiceId: { eq: id } })) };
  const { data: allPricingData, errors: pricingErrors } = await dbClient.models.businessServicePricing.list({ filter: pricingFilter });
  if (pricingErrors) throw new Error(JSON.stringify(pricingErrors));

  const allPricing = allPricingData as BusinessServicePricing[];
  const pricingMap = allPricing.reduce((acc, pricing) => {
    const existing = acc.get(pricing.businessServiceId) || [];
    return acc.set(pricing.businessServiceId, [...existing, pricing]);
  }, new Map<string, BusinessServicePricing[]>());


  return consultations.reduce((acc, consultation) => {
    const service = serviceMap.get(consultation.businessServiceId);
    const pricing = pricingMap.get(consultation.businessServiceId) || [];

    if (!service) return acc;

    const totalFee = pricing.reduce((sum, p) => sum + p.fee, 0);
    const existing = acc.get(service.id) || { totalRevenue: 0, count: 0 };

    acc.set(service.id, {
      totalRevenue: existing.totalRevenue + totalFee,
      count: existing.count + 1
    });

    return acc;
  }, new Map<string, { totalRevenue: number; count: number }>());
};
