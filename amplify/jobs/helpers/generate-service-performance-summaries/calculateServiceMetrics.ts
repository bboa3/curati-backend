import ServicePriceCalculator from '../../../functions/helpers/price/ServicePriceCalculator';
import {
  Appointment,
  AppointmentStatus,
  BusinessServicePricing,
  Contract,
  ContractPayment,
  PricingCondition
} from '../../../functions/helpers/types/schema';
import { calculateAverage, calculateCancellationRate } from './calculator';
import { groupPricingByService } from './groupPricingByService';
import { initializeServiceMetrics, ServiceMetrics } from './initializeMetrics';

interface CalculationInput {
  contracts: Contract[];
  appointments: Appointment[];
  payments: ContractPayment[];
  businessServicePricing: BusinessServicePricing[];
}

export const calculateServiceMetrics = ({
  contracts,
  appointments,
  payments,
  businessServicePricing,
}: CalculationInput): Map<string, ServiceMetrics> => {
  const metricsMap = new Map<string, ServiceMetrics>();
  const pricingByService = groupPricingByService(businessServicePricing);

  contracts.forEach(contract => {
    const serviceId = contract.businessServiceId;
    const existing = metricsMap.get(serviceId) || initializeServiceMetrics(serviceId);
    const servicePricing = pricingByService.get(serviceId) || [];

    try {
      const calculator = new ServicePriceCalculator();
      const { totalAmount } = calculator.calculateServiceTotal({
        businessServicePricing: servicePricing,
        appliedPricingConditions: contract.appliedPricingConditions as PricingCondition[]
      });

      metricsMap.set(serviceId, {
        ...existing,
        contractsSold: existing.contractsSold + 1,
        totalContractsValue: existing.totalContractsValue + totalAmount
      });
    } catch (error: any) {
      throw new Error(`Failed to calculate contract value for contract ${contract.id}: ${error.message}`);
    }
  });

  appointments.forEach(appointment => {
    const serviceId = appointment.businessServiceId;
    const existing = metricsMap.get(serviceId) || initializeServiceMetrics(serviceId);

    const newMetrics = { ...existing };
    if (appointment.status === AppointmentStatus.COMPLETED) {
      newMetrics.appointmentsCompleted++;
      newMetrics.averageSessionDuration += appointment.duration;
    }

    newMetrics.rescheduledAppointments +=
      appointment.patientRescheduledCount + appointment.professionalRescheduledCount;

    metricsMap.set(serviceId, newMetrics);
  });

  payments.forEach(payment => {
    const serviceId = contracts.find(c => c.id === payment.contractId)?.businessServiceId;
    if (!serviceId) return;

    const existing = metricsMap.get(serviceId) || initializeServiceMetrics(serviceId);
    metricsMap.set(serviceId, {
      ...existing,
      totalRevenue: existing.totalRevenue + payment.amount
    });
  });

  metricsMap.forEach((metrics, serviceId) => {
    metrics.averageSessionDuration = calculateAverage(
      metrics.averageSessionDuration,
      metrics.appointmentsCompleted
    );

    metrics.cancellationRate = calculateCancellationRate(
      appointments.filter(a => a.businessServiceId === serviceId)
    );

    metrics.averageRevenuePerContract = calculateAverage(
      metrics.totalContractsValue,
      metrics.contractsSold
    );

    metrics.averageRevenuePerAppointment = calculateAverage(
      metrics.totalRevenue,
      metrics.appointmentsCompleted
    );
  });

  return metricsMap;
};
