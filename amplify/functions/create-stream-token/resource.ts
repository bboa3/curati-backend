import { defineFunction, secret } from "@aws-amplify/backend"

export const createStreamToken = defineFunction({
  name: "create-stream-token",
  entry: './handler.ts',
  environment: {
    STREAM_API_KEY: secret('STREAM_API_KEY'),
    STREAM_API_SECRET: secret('STREAM_API_SECRET')
  }
})