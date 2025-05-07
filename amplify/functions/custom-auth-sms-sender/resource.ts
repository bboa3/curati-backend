import { defineFunction, secret } from "@aws-amplify/backend"

export const customAuthSmsSender = defineFunction({
  name: "custom-auth-sms-sender",
  entry: './handler.ts',
  environment: {
    SMS_API_KEY: secret('SMS_API_KEY'),
    SMS_SENDER_ID: secret('SMS_SENDER_ID')
  }
})