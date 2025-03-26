import { defineFunction } from "@aws-amplify/backend";

export const newValidatedPrescriptionPatientNotifier = defineFunction({
  name: "new-validated-prescription-patient-notifier",
  resourceGroupName: "data",
  entry: "./handler.ts",
  environment: {
    VERIFIED_SES_SENDER_EMAIL: "sales@curati.life",
    VERIFIED_SES_SUPPORT_EMAIL: "support@curati.life",
  }
});