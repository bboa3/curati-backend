import { defineFunction } from "@aws-amplify/backend";

export const invoiceStreamWatcher = defineFunction({
  name: "invoice-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 2,
  environment: {
    SUPPORT_PHONE: "874444689",
    VERIFIED_SES_SENDER_EMAIL: "noreply@curati.life",
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
  }
});