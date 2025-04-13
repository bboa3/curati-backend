import { defineFunction } from "@aws-amplify/backend"

export const generateDailySalesSummaries = defineFunction({
  name: "generate-daily-sales-summaries",
  entry: './handler.ts',
  timeoutSeconds: 60 * 10, // 10 minutes
  schedule: 'every day'
})