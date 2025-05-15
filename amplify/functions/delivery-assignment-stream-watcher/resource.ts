import { defineFunction, secret } from "@aws-amplify/backend";

export const deliveryAssignmentStreamWatcher = defineFunction({
  name: "delivery-assignment-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 5, // 5 minutes
  environment: {
    SUPPORT_PHONE: "874444689",
    VERIFIED_SES_SENDER_EMAIL: "noreply@curati.life",
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
    SMS_API_KEY: secret('SMS_API_KEY'),
    SMS_SENDER_ID: secret('SMS_SENDER_ID')
  }
});