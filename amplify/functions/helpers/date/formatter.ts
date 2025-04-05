import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import duration from 'dayjs/plugin/duration';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

const MAPUTO_TZ = 'Africa/Maputo';
dayjs.tz.setDefault(MAPUTO_TZ);

type DateType = dayjs.Dayjs | number | string | Date | undefined;

export const formatTimeWithHourSuffix = (date: DateType) => {
  if (!date) return '';
  return dayjs.utc(date).tz(MAPUTO_TZ).format('HH[h]mm'); // UTC -> Local, explicit format
};

export const formatDateNumeric = (date: DateType) => {
  if (!date) return '';
  return dayjs.utc(date).tz(MAPUTO_TZ).format('DD/MM/YYYY'); // UTC -> Local
};

export const formatDateFullTextual = (date: DateType) => {
  if (!date) return '';
  return dayjs.utc(date).tz(MAPUTO_TZ).format('DD [de] MMMM [de] YYYY'); // UTC -> Local
};

export const formatDateAbbreviatedMonth = (date: DateType) => {
  if (!date) return '';
  return dayjs.utc(date).tz(MAPUTO_TZ).format('DD MMM YYYY'); // UTC -> Local
};

export const formatDateTimeNumeric = (date: DateType) => {
  if (!date) return '';
  return dayjs.utc(date).tz(MAPUTO_TZ).format('DD/MM/YYYY [às] HH:mm'); // UTC -> Local
};

export const formatTime = (date: DateType) => {
  if (!date) return '';
  return dayjs.utc(date).tz(MAPUTO_TZ).format('HH:mm');
};

export const formatDayOfWeek = (dayIndex: number): string => {
  if (dayIndex < 0 || dayIndex > 6) {
    console.warn(`Invalid day index: ${dayIndex}.  Returning an empty string.`);
    return '';
  }
  return dayjs().day(dayIndex).locale('pt-br').format('dddd');
};

export function formatETA(pickedUpAt: DateType, estimatedDurationMinutes: number | undefined | null): string {
  if (!pickedUpAt || estimatedDurationMinutes === undefined || estimatedDurationMinutes === null) {
    return "Em breve";
  }

  const pickupTime = dayjs(pickedUpAt).utc().tz(MAPUTO_TZ);
  const etaTime = pickupTime.add(estimatedDurationMinutes, 'minute');

  return `aproximadamente às ${etaTime.format('HH:mm')}`;
}

export const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];