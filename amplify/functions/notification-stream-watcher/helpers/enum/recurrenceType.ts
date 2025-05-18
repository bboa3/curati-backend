import { RecurrenceType } from "../../../helpers/types/schema";

const RECURRENCE_TYPE_DESCRIPTIONS = new Map<RecurrenceType, string>([
  [RecurrenceType.DAILY, 'Diário'],
  [RecurrenceType.WEEKLY, 'Semanal'],
  [RecurrenceType.MONTHLY, 'Mensal'],
  [RecurrenceType.YEARLY, 'Anual'],
  [RecurrenceType.NONE, 'Nenhum']
]);

export const convertRecurrenceType = (type: RecurrenceType): string => {
  return RECURRENCE_TYPE_DESCRIPTIONS.get(type) || '';
};
