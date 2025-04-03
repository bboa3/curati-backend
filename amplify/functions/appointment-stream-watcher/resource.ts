import { defineFunction } from "@aws-amplify/backend";

export const appointmentStreamWatcher = defineFunction({
  name: "appointment-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  environment: {
    SUPPORT_PHONE: "874444689",
    VERIFIED_SES_SENDER_EMAIL: "sales@curati.life",
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
  }
});