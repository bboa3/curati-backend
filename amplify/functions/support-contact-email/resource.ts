import { defineFunction } from "@aws-amplify/backend";

export const supportContactEmail = defineFunction({
  name: "support-contact-email",
  entry: "./handler.ts",
  environment: {
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
    VERIFIED_SES_SENDER_EMAIL: "sales@curati.life"
  }
});