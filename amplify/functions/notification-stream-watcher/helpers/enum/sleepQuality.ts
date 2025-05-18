import { SleepQuality } from "../../../helpers/types/schema";

const SLEEP_QUALITY_DESCRIPTIONS = new Map<SleepQuality, string>([
  [SleepQuality.POOR, 'Ruim'],
  [SleepQuality.AVERAGE, 'Médio'],
  [SleepQuality.GOOD, 'Bom'],
  [SleepQuality.EXCELLENT, 'Excelente'],
]);

export const convertSleepQuality = (type: SleepQuality): string => {
  return SLEEP_QUALITY_DESCRIPTIONS.get(type) || '';
};
