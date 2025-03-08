import { defineFunction, secret } from "@aws-amplify/backend"

export const getSecrets = defineFunction({
  name: "get-secrets",
  entry: './handler.ts',
  environment: {
    AWS_ACCESS_KEY_ID: secret('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: secret('AWS_SECRET_ACCESS_KEY'),
    AWS_REGION: secret('AWS_REGION')
  }
})