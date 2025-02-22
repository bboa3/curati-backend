import { env } from "$amplify/env/post-confirmation";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const cognitoClient = new CognitoIdentityProviderClient()

export const handler: PostConfirmationTriggerHandler = async (event) => {
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

  const command = new AdminAddUserToGroupCommand({
    Username: authId,
    GroupName: 'PATIENT',
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
  })

  await cognitoClient.send(command)

  return event;
};