import { defineFunction } from "@aws-amplify/backend";

export const deliveryAssignmentStreamWatcher = defineFunction({
  name: "delivery-assignment-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 5, // 5 minutes
  environment: {
    SUPPORT_PHONE: "874444689",
    VERIFIED_SES_SENDER_EMAIL: "sales@curati.life",
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
  }
});