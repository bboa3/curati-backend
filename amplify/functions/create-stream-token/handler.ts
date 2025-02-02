import { env } from '$amplify/env/create-stream-token';
import { StreamChat } from 'stream-chat';
import { Schema } from '../../data/resource';

const client = StreamChat.getInstance(env.STREAM_API_KEY, env.STREAM_API_SECRET);

type Handler = Schema['createStreamToken']['functionHandler'];

export const handler: Handler = async (event) => {
  try {
    const { userId } = event.arguments;
    const token = client.createToken(userId);

    return { content: token };
  } catch (e) {
    console.log(e);
    console.log(event);
    throw new Error("An unexpected error has occured while processing your request.");
  }
}