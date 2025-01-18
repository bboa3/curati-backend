import { defineFunction, secret } from "@aws-amplify/backend"

export const addOrUpdateSearchableRecord = defineFunction({
  name: "add-or-update-searchable-record",
  entry: './handler.ts',
  environment: {
    ALGOLIA_APP_ID: secret('ALGOLIA_APP_ID'),
    ALGOLIA_WRITE_API_KEY: secret('ALGOLIA_WRITE_API_KEY')
  }
})