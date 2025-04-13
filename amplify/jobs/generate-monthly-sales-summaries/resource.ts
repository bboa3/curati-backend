import { defineFunction } from "@aws-amplify/backend"

export const generateMonthlySalesSummaries = defineFunction({
  name: "generate-monthly-sales-summaries",
  entry: './handler.ts',
  timeoutSeconds: 60 * 10, // 10 minutes
  schedule: 'every month'
})