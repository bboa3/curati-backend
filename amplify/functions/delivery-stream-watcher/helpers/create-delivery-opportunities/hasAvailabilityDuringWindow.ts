import dayjs, { Dayjs } from "dayjs";
import { ProfessionalAvailability, RecurrencePattern, TimeSlot } from "../../../helpers/types/schema";

interface HasAvailabilityDuringWindowInput {
  professionalAvailability: ProfessionalAvailability;
  recurrencePattern: RecurrencePattern;
  preferredDeliveryTimeStartAt: string;
  preferredDeliveryTimeEndAt: string;
}

export const hasAvailabilityDuringWindow = ({
  professionalAvailability,
  recurrencePattern,
  preferredDeliveryTimeStartAt,
  preferredDeliveryTimeEndAt
}: HasAvailabilityDuringWindowInput): boolean => {
  const start = dayjs.utc(preferredDeliveryTimeStartAt);
  const end = dayjs.utc(preferredDeliveryTimeEndAt);

  if (!professionalAvailability?.timeSlots?.length) return false;
  if (!recurrencePattern?.daysOfWeek?.length) return false;

  if (!start.isSame(end, 'day')) return false;
  if (end.isBefore(start)) return false;

  const deliveryDate = start.startOf('day');
  if (professionalAvailability.exclusions?.some(exclusion =>
    dayjs(exclusion).isSame(deliveryDate, 'day'))
  ) {
    return false;
  }

  const dayOfWeek = deliveryDate.day();
  if (!recurrencePattern.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }

  return hasTimeSlotOverlap(
    professionalAvailability.timeSlots,
    start,
    end
  );
};

const hasTimeSlotOverlap = (timeSlots: TimeSlot[], start: Dayjs, end: Dayjs): boolean => {
  const deliveryStartMinutes = start.hour() * 60 + start.minute();
  const deliveryEndMinutes = end.hour() * 60 + end.minute();

  return timeSlots.some(slot => {
    const [slotStartHour, slotStartMinute] = slot.startTime.split(':').map(Number);
    const [slotEndHour, slotEndMinute] = slot.endTime.split(':').map(Number);

    const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
    const slotEndMinutes = slotEndHour * 60 + slotEndMinute;

    return (
      deliveryStartMinutes < slotEndMinutes &&
      deliveryEndMinutes > slotStartMinutes
    );
  });
};