import dayjs from "dayjs";
import { formatDateTimeNumeric, formatTime } from "../../helpers/date/formatter";
import { AppointmentParticipantType, AppointmentType, ProfessionalType, RemindedItemType, ReminderStatus, RepeatType } from "../../helpers/types/schema";

interface CreateReminderInput {
  dbClient: any;
  appointmentId: string;
  purpose: string;
  appointmentDateTime: string;
  appointmentType: AppointmentType;
  professionalType: ProfessionalType
  recipients: {
    userId: string;
    type: AppointmentParticipantType;
    otherPartyName: string;
  }[];
}

export async function createReminders({ dbClient, appointmentDateTime, purpose, professionalType, appointmentType, appointmentId, recipients }: CreateReminderInput) {
  await Promise.all(recipients.map(async recipient => {
    const now = dayjs().utc();
    const appointmentDate = dayjs(appointmentDateTime).utc();

    const isRecipientPatient = recipient.type === AppointmentParticipantType.PATIENT;
    const recipientAppName = isRecipientPatient ? 'Cúrati' : (professionalType === ProfessionalType.PHARMACIST ? 'Cúrati Rx' : 'Cúrati Pro');
    const formattedTime = formatTime(appointmentDate);
    const formattedDateTime = formatDateTimeNumeric(appointmentDate);

    let reminderTitle = '';
    let reminderMessage = '';
    const dateTimes = [appointmentDate.subtract(30, 'minutes')];

    if (appointmentDate.diff(now, 'day') >= 1) {
      reminderTitle = `Lembrete: Consulta Cúrati Amanhã (${formattedDateTime})`;
      if (isRecipientPatient) {
        reminderMessage = `A sua consulta (${purpose}) com ${recipient.otherPartyName} é amanhã, ${formattedTime}. Detalhes na app ${recipientAppName}.`;
      } else {
        reminderMessage = `Consulta (${purpose}) com ${recipient.otherPartyName} agendada para amanhã, ${formattedTime}. Detalhes na app ${recipientAppName}.`;
      }
      dateTimes.push(appointmentDate.subtract(1, 'days'));
    }

    if (appointmentDate.diff(now, 'hour') >= 1) {
      let actionText = '';
      reminderTitle = `Lembrete: Consulta Cúrati em 1 Hora (${formattedTime})`;

      if (appointmentType === AppointmentType.IN_PERSON) {
        actionText = isRecipientPatient ? 'Dirija-se ao local.' : 'Prepare-se para receber o paciente.';
      } else {
        actionText = isRecipientPatient ? 'Prepare-se para a ligação/sessão.' : 'Prepare-se para iniciar a sessão.';
      }

      if (isRecipientPatient) {
        reminderMessage = `Consulta (${purpose}) com ${recipient.otherPartyName} começa em 1 hora (${formattedTime}). ${actionText} App ${recipientAppName} p/ detalhes.`;
      } else {
        reminderMessage = `Consulta (${purpose}) com ${recipient.otherPartyName} começa em 1 hora (${formattedTime}). ${actionText} App ${recipientAppName} p/ detalhes.`;
      }
    }

    if (appointmentDate.diff(now, 'minute') >= 30) {
      reminderTitle = `Consulta Cúrati Começa em 30 Min (${formattedTime})`;
      let actionText = '';
      if (appointmentType === AppointmentType.IN_PERSON) {
        actionText = isRecipientPatient ? 'Esteja a postos no local.' : 'Paciente deve chegar em breve.';
      } else {
        actionText = isRecipientPatient ? 'Verifique ligação/prepare-se.' : 'Prepare-se para iniciar.';
      }

      if (isRecipientPatient) {
        reminderMessage = `Consulta (${purpose}) com ${recipient.otherPartyName} começa em 30 min (${formattedTime}). ${actionText} App ${recipientAppName}.`;
      } else {
        reminderMessage = `Consulta (${purpose}) com ${recipient.otherPartyName} começa em 30 min (${formattedTime}). ${actionText} App ${recipientAppName}.`;
      }
    }

    for (const dateTime of dateTimes) {
      const { errors } = await dbClient.models.reminder.create({
        userId: recipient.userId,
        relatedItemRemindedId: appointmentId,
        remindedItemType: RemindedItemType.APPOINTMENT,
        title: reminderTitle,
        message: reminderMessage,
        dateTime: dateTime.toISOString(),
        status: ReminderStatus.PENDING,
        repeat: RepeatType.NONE
      })

      if (errors) {
        throw new Error(`Failed to create reminder ${dateTime.toISOString()}: ${JSON.stringify(errors)}`);
      }
    }
  }))
}