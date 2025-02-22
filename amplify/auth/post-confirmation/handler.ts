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
  try {
    const { data: user } = await (client.models.user as any).git({ authId: event.request.userAttributes.sub });

    if (user) {
      return event;
    }

    const authId = event.request.userAttributes.sub;

    await (client.models.user as any).create({
      authId: authId,
      name: event.userName,
      email: event.request.userAttributes.email,
      phone: event.request.userAttributes.phone_number,
      expoPushTokens: [],
      role: 'PATIENT',
      isDeleted: false
    });

    return event;

  } catch (error) {
    console.error("Creation error:", error);
    console.log("Event details:", event);
    throw new Error(`User creation failed: ${error}`);
  }
};