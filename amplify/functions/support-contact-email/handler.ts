import { env } from '$amplify/env/support-contact-email';
import { Schema } from "../../data/resource";
import { sendEmailToSupport } from "./helpers/send-email-to-support";


type Handler = Schema['supportContactEmail']['functionHandler']
export const handler: Handler = async (event) => {
  try {
    const { name, email, phone, userType, reason, subject, message } = event.arguments

    await sendEmailToSupport({
      toAddresses: [env.VERIFIED_SES_SUPPORT_EMAIL],
      name,
      email,
      phone: phone || undefined,
      userType,
      reason,
      subject: subject || undefined,
      message
    })

    return { content: 'Done' };
  } catch (error) {
    console.error("Creation error:", error);
    console.log("Event details:", event);
    throw new Error(`User creation failed: ${error}`);
  }
}