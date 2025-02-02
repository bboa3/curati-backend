import { env } from '$amplify/env/delete-searchable-record';
import { searchClient } from '@algolia/client-search';
import { Schema } from '../../data/resource';

const client = searchClient(env.ALGOLIA_APP_ID, env.ALGOLIA_WRITE_API_KEY);
type Handler = Schema['deleteSearchableRecord']['functionHandler'];

export const handler: Handler = async (event) => {
  try {
    const { indexName, objectID } = event.arguments;

    await client.deleteObject({
      indexName,
      objectID,
    })

    return { content: 'Done' };
  } catch (e) {
    console.log(e);
    console.log(event);
    throw new Error("An unexpected error has occured while processing your request.");
  }
}