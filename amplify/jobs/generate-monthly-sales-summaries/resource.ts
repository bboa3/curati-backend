import { defineFunction } from "@aws-amplify/backend"

export const generateMonthlySalesSummaries = defineFunction({
  name: "generate-monthly-sales-summaries",
  entry: './handler.ts',
  schedule: 'every month'
})