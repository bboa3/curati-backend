import { env } from '$amplify/env/add-or-update-searchable-record';
import { searchClient } from '@algolia/client-search';
import { Schema } from '../../data/resource';

const client = searchClient(env.ALGOLIA_APP_ID, env.ALGOLIA_WRITE_API_KEY);
type Handler = Schema['addOrUpdateSearchableRecord']['functionHandler'];

export const handler: Handler = async (event) => {
  try {
    const { indexName, objectID, body } = event.arguments;

    await client.addOrUpdateObject({
      indexName,
      objectID,
      body: body as Record<string, unknown>
    })

    return { content: 'Done' };
  } catch (e) {
    console.log("Exception");
    console.log(e);
    console.log(event);
    throw new Error("An unexpected error has occured while processing your request.");
  }
}