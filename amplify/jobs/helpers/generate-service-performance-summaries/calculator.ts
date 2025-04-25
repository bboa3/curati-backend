import { Appointment, AppointmentStatus } from "../../../functions/helpers/types/schema";

export const calculateCancellationRate = (appointments: Appointment[]): number => {
  const total = appointments.length;
  const cancelled = appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length;
  return total > 0 ? parseFloat(((cancelled / total) * 100).toFixed(2)) : 0;
};

export const calculateRescheduledCount = (appointments: Appointment[]): number => {
  return appointments.reduce((sum, appt) =>
    sum + appt.patientRescheduledCount + appt.professionalRescheduledCount, 0);
};

export const calculateAverage = (total: number, count: number): number => {
  return count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
};