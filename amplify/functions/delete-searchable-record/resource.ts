import { defineFunction, secret } from "@aws-amplify/backend"

export const deleteSearchableRecord = defineFunction({
  name: "delete-searchable-record",
  entry: './handler.ts',
  environment: {
    ALGOLIA_APP_ID: secret('ALGOLIA_APP_ID'),
    ALGOLIA_WRITE_API_KEY: secret('ALGOLIA_WRITE_API_KEY')
  }
})