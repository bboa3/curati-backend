import { AppointmentType } from "../../../helpers/types/schema";

const APPOINTMENT_TYPE_DESCRIPTIONS = new Map<AppointmentType, string>([
  [AppointmentType.VIDEO, 'Vídeo'],
  [AppointmentType.AUDIO, 'Áudio'],
  [AppointmentType.TEXT, 'Texto'],
  [AppointmentType.IN_PERSON, 'Presencial'],
]);

export const convertAppointmentType = (type: AppointmentType): string => {
  return APPOINTMENT_TYPE_DESCRIPTIONS.get(type) || '';
};
