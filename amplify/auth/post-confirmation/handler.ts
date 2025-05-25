import { env } from "$amplify/env/post-confirmation";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const phoneCode = '+258';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    const authId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const phoneNumber = event.request.userAttributes.phone_number;

    const phone = phoneNumber.startsWith(phoneCode)
      ? phoneNumber.slice(phoneCode.length)
      : phoneNumber;

    const { data: user } = await (client.models as any).user.get({ authId });

    if (user) {
      return event;
    }

    await (client.models as any).user.create({
      authId: authId,
      name: event.userName,
      email: email,
      phone: phone,
      pushTokens: [],
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