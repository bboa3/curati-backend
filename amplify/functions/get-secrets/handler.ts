import { env } from '$amplify/env/get-secrets';
import { Schema } from '../../data/resource';

type Handler = Schema['getSecrets']['functionHandler'];

export const handler: Handler = async (event) => {
  try {
    return {
      content: JSON.stringify({
        awsAccessKeyId: env.AMAZON_ACCESS_KEY_ID,
        awsSecretAccessKey: env.AMAZON_SECRET_ACCESS_KEY,
        awsRegion: env.AMAZON_REGION
      })
    };
  } catch (e) {
    console.log(e);
    console.log(event);
    throw new Error(`An unexpected error has occurred while processing your request. Details: ${e}`);
  }
}