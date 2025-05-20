import dayjs from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { formatDateTimeNumeric, formatTime } from "../../helpers/date/formatter";
import { Appointment, AppointmentParticipantType, AppointmentType, NotificationTemplateKey, RemindedItemType, ReminderStatus, RepeatType } from "../../helpers/types/schema";

interface CreateReminderInput {
  dbClient: any;
  appointment: Appointment;
  recipients: {
    userId: string;
    type: AppointmentParticipantType;
    name: string;
    otherPartyName: string;
  }[];
}

export async function createReminders({ dbClient, appointment, recipients }: CreateReminderInput) {
  const { id: appointmentId, type: appointmentType, appointmentNumber, appointmentDateTime, purpose } = appointment;
  await Promise.all(recipients.map(async recipient => {
    const now = dayjs().utc();
    const appointmentDate = dayjs(appointmentDateTime).utc();

    const isRecipientPatient = recipient.type === AppointmentParticipantType.PATIENT;
    const formattedTime = formatTime(appointmentDate);
    const formattedDateTime = formatDateTimeNumeric(appointmentDate);

    let reminderTimingText = '';
    let specificActionInstruction = '';
    const dateTimes = [appointmentDate.subtract(30, 'minutes')];

    if (appointmentDate.diff(now, 'day') >= 1) {
      reminderTimingText = `Amanhã (${formattedDateTime})`;
      dateTimes.push(appointmentDate.subtract(1, 'days'));
    }

    if (appointmentDate.diff(now, 'hour') >= 1) {
      reminderTimingText = `Em 1 Hora (${formattedTime})`;

      if (appointmentType === AppointmentType.IN_PERSON) {
        specificActionInstruction = isRecipientPatient ? 'Dirija-se ao local.' : 'Prepare-se para receber o paciente.';
      } else {
        specificActionInstruction = isRecipientPatient ? 'Prepare-se para a ligação/sessão.' : 'Prepare-se para iniciar a sessão.';
      }
    }

    if (appointmentDate.diff(now, 'minute') >= 30) {
      reminderTimingText = `Em 30 Min (${formattedTime})`;

      if (appointmentType === AppointmentType.IN_PERSON) {
        specificActionInstruction = isRecipientPatient ? 'Esteja a postos no local.' : 'Paciente deve chegar em breve.';
      } else {
        specificActionInstruction = isRecipientPatient ? 'Verifique ligação/prepare-se.' : 'Prepare-se para iniciar.';
      }
    }

    const patientDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;
    const professionalDeepLink = `curati://life.curati.rx/(app)/profile/appointments/${appointmentId}`;
    const appointmentDeepLink = isRecipientPatient ? patientDeepLink : professionalDeepLink;

    for (const dateTime of dateTimes) {
      const { errors } = await dbClient.models.reminder.create({
        id: generateUUIDv4(),
        userId: recipient.userId,
        relatedItemRemindedId: appointmentId,
        remindedItemType: RemindedItemType.APPOINTMENT,
        templateKey: NotificationTemplateKey.APPOINTMENT_REMINDER,
        templateData: JSON.stringify({
          recipientName: recipient.name,
          otherPartyName: recipient.otherPartyName,
          recipientType: recipient.type,
          appointmentNumber: appointmentNumber,
          appointmentDateTime: appointmentDateTime,
          appointmentType: appointmentType,
          purpose: purpose,
          reminderTimingText: reminderTimingText,
          specificActionInstruction: specificActionInstruction,
        }),
        payload: {
          href: appointmentDeepLink
        },
        triggerDateTime: dateTime.toISOString(),
        status: ReminderStatus.PENDING,
        repeat: RepeatType.NONE
      })

      if (errors) {
        throw new Error(`Failed to create reminder ${dateTime.toISOString()}: ${JSON.stringify(errors)}`);
      }
    }
  }))
}