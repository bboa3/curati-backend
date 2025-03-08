import { defineFunction } from "@aws-amplify/backend"

export const getSecrets = defineFunction({
  name: "get-secrets",
  entry: './handler.ts',
  environment: {
  }
})