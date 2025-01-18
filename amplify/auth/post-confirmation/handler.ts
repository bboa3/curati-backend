import { env } from "$amplify/env/post-confirmation";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { uuidv7 } from 'uuidv7';
import { type Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { data: users } = await (client.models.user as any).list({ filter: { authId: { eq: event.request.userAttributes.sub } }, limit: 2 });

  if (users.length > 0) {
    return event;
  }

  await (client.models.user as any).create({
    id: uuidv7(),
    authId: event.request.userAttributes.sub,
    name: event.userName,
    email: event.request.userAttributes.email,
    phone: event.request.userAttributes.phone_number,
    gender: 'UNKNOWN',
    expoPushTokens: [],
    role: 'PATIENT',
    isDeleted: false
  });

  return event;
};