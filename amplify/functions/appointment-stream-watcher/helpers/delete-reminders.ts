import { Logger } from "@aws-lambda-powertools/logger";
import { Reminder } from "../../helpers/types/schema";

interface CreateReminderInput {
  dbClient: any;
  logger: Logger;
  appointmentId: string;
  recipients: {
    userId: string;
  }[];
}

export async function deleteReminders({ dbClient, logger, appointmentId, recipients }: CreateReminderInput) {
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
    logger.error("Failed to fetch reminders", { errors: remindersErrors });
    return;
  }
  const reminders = remindersData as Reminder[] || [];

  await Promise.all(reminders.map(async reminder => {
    await dbClient.models.reminder.delete({ id: reminder.id });
  }))
}