import { Logger } from "@aws-lambda-powertools/logger";
import { Dayjs } from "dayjs";
import { collectDeliveryRevenue } from "./collectDeliveryRevenue";
import { collectMedicineMetrics } from "./collectMedicineMetrics";
import { collectServiceRevenue } from "./collectServiceRevenue";

export const collectFinancialMetrics = async (params: {
  dbClient: any;
  logger: Logger;
  businessId: string;
  periodStart: Dayjs;
  periodEnd: Dayjs;
}) => {
  const [medicine, service, delivery] = await Promise.all([
    collectMedicineMetrics(params),
    collectServiceRevenue(params),
    collectDeliveryRevenue(params)
  ]);

  return {
    totalRevenue: medicine.revenue + service.revenue + delivery.revenue,
    medicineRevenue: medicine.revenue,
    serviceRevenue: service.revenue,
    deliveryRevenue: delivery.revenue,
    totalMedicineUnitsSold: medicine.unitsSold,
    totalMedicineOrdersCount: medicine.ordersCount,
    totalMedicineUnitsRefunded: medicine.unitsRefunded
  };
};
