import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
dayjs.extend(localizedFormat);

dayjs.extend(utc);
dayjs.extend(timezone);

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

export const isValidDate = (date: DateType): boolean => {
  return dayjs(date).isValid();
};

export const diff = (date1: DateType, date2: DateType, unit: dayjs.OpUnitType, float?: boolean) => {
  if (!date1 || !date2) return '';
  return dayjs(date1).diff(date2, unit, float);
}

export const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];