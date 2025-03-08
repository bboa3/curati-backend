import { env } from '$amplify/env/create-stream-token';
import { Schema } from '../../data/resource';

type Handler = Schema['getSecrets']['functionHandler'];

export const handler: Handler = async (event) => {
  try {
    return {
      content: JSON.stringify({
        awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
        awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        awsRegion: env.AWS_REGION
      })
    };
  } catch (e) {
    console.log(e);
    console.log(event);
    throw new Error(`An unexpected error has occurred while processing your request. Details: ${e}`);
  }
}