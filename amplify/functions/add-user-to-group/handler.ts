import { env } from "$amplify/env/add-user-to-group";
import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { Schema } from "../../data/resource";

const client = new CognitoIdentityProviderClient()

type Handler = Schema['addUserToGroup']['functionHandler']

export const handler: Handler = async (event) => {
  try {
    const { authId, groupName } = event.arguments
    const command = new AdminAddUserToGroupCommand({
      Username: authId,
      GroupName: groupName,
      UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })

    await client.send(command)
    return { content: 'Done' };
  } catch (e) {
    console.log(e);
    console.log(event);
    throw new Error("An unexpected error has occured while processing your request.");
  }
}