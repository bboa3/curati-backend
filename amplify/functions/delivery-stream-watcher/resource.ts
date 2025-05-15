import { defineFunction, secret } from "@aws-amplify/backend";

export const deliveryStreamWatcher = defineFunction({
  name: "delivery-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 10, // 10 minutes
  environment: {
    DRIVER_COMMISSION_PERCENTAGE: '0.8',
    SUPPORT_PHONE: "874444689",
    VERIFIED_SES_SENDER_EMAIL: "noreply@curati.life",
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
    SMS_API_KEY: secret('SMS_API_KEY'),
    SMS_SENDER_ID: secret('SMS_SENDER_ID')
  }
});