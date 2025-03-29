import { defineFunction } from "@aws-amplify/backend"

export const generateDailySalesSummaries = defineFunction({
  name: "generate-daily-sales-summaries",
  entry: './handler.ts',
  schedule: 'every day'
})