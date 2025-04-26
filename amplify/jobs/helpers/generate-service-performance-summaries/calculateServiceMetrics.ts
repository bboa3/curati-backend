import ServicePriceCalculator from '../../../functions/helpers/price/ServicePriceCalculator';
import {
  Appointment,
  AppointmentStatus,
  BusinessServicePricing,
  Contract,
  ContractPayment,
  PricingCondition
} from '../../../functions/helpers/types/schema';
import { initializeServiceMetrics, ServiceMetrics } from './initializeMetrics';

interface CalculationInput {
  businessServiceId: string;
  contracts: Contract[];
  appointments: Appointment[];
  payments: ContractPayment[];
  businessServicePricing: BusinessServicePricing[];
}

export const calculateServiceMetrics = ({
  businessServiceId,
  contracts,
  appointments,
  payments,
  businessServicePricing,
}: CalculationInput): ServiceMetrics => {

  const contractMetrics = contracts.reduce((metrics, contract) => {
    const calculator = new ServicePriceCalculator();
    const { totalAmount } = calculator.calculateServiceTotal({
      businessServicePricing: businessServicePricing,
      appliedPricingConditions: contract.appliedPricingConditions as PricingCondition[]
    });

    return {
      contractsSold: metrics.contractsSold + 1,
      totalContractsValue: metrics.totalContractsValue + totalAmount
    }
  }, {
    contractsSold: 0,
    totalContractsValue: 0
  });

  const appointmentMetrics = appointments.reduce((metrics, appointment) => {
    if (appointment.status === AppointmentStatus.COMPLETED) {
      return {
        appointmentsCompleted: metrics.appointmentsCompleted + 1,
        averageSessionDuration: metrics.averageSessionDuration + appointment.duration,
        rescheduledAppointments: metrics.rescheduledAppointments + (appointment.patientRescheduledCount + appointment.professionalRescheduledCount)
      }
    }

    return metrics;
  }, {
    appointmentsCompleted: 0,
    averageSessionDuration: 0,
    rescheduledAppointments: 0
  })

  const paymentMetrics = payments.reduce((metrics, payment) => {
    return {
      totalRevenue: metrics.totalRevenue + payment.amount
    }
  }, {
    totalRevenue: 0
  });

  return {
    ...initializeServiceMetrics(businessServiceId),
    ...contractMetrics,
    ...appointmentMetrics,
    ...paymentMetrics
  }
};
