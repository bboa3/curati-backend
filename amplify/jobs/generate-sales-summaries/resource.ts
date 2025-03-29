import { defineFunction } from "@aws-amplify/backend"

export const generateSalesSummaries = defineFunction({
  name: "generate-sales-summaries",
  entry: './handler.ts',
  schedule: 'every day'
})