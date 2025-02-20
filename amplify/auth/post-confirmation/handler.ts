import { env } from "$amplify/env/post-confirmation";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { data: user } = await (client.models.user as any).git({ authId: event.request.userAttributes.sub });

  if (user) {
    return event;
  }

  await (client.models.user as any).create({
    authId: event.request.userAttributes.sub,
    name: event.userName,
    email: event.request.userAttributes.email,
    phone: event.request.userAttributes.phone_number,
    expoPushTokens: [],
    role: 'PATIENT',
    isDeleted: false
  });

  return event;
};