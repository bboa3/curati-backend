import { defineFunction, secret } from "@aws-amplify/backend"

export const getSecrets = defineFunction({
  name: "get-secrets",
  entry: './handler.ts',
  environment: {
    AMAZON_ACCESS_KEY_ID: secret('AMAZON_ACCESS_KEY_ID'),
    AMAZON_SECRET_ACCESS_KEY: secret('AMAZON_SECRET_ACCESS_KEY'),
    AMAZON_REGION: secret('AMAZON_REGION')
  }
})