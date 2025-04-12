import { Reminder } from "../../helpers/types/schema";

interface CreateReminderInput {
  dbClient: any;
  appointmentId: string;
  recipients: {
    userId: string;
  }[];
}

export async function deleteReminders({ dbClient, appointmentId, recipients }: CreateReminderInput) {
  const recipientsFilters = recipients.map(({ userId }) => ({ userId: { eq: userId } }))

  const { data: remindersData, errors: remindersErrors } = await dbClient.models.reminder.list({
    filter: {
      and: [
        { or: recipientsFilters },
        { relatedItemRemindedId: { eq: appointmentId } }
      ]
    },
  });

  if (remindersErrors) {
    throw new Error(`Error deleting reminders: ${JSON.stringify(remindersErrors)}`);
  }
  const reminders = remindersData as Reminder[] || [];

  await Promise.all(reminders.map(async reminder => {
    await dbClient.models.reminder.delete({ id: reminder.id });
  }))
}