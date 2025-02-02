import { env } from "$amplify/env/admin-create-user";
import {
  AdminCreateUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient
} from "@aws-sdk/client-cognito-identity-provider";
import { Schema } from "../../data/resource";

const client = new CognitoIdentityProviderClient()

type Handler = Schema['adminCreateUser']['functionHandler']
export const handler: Handler = async (event) => {
  try {
    const { phone, password } = event.arguments
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
      Username: phone
    })

    const user = await client.send(getUserCommand)

    if (user?.Username) {
      return { content: user.Username };
    }

    const command = new AdminCreateUserCommand({
      Username: phone,
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: 'phone',
          Value: phone
        },
      ],
      ValidationData: [
        {
          Name: 'phone',
          Value: phone
        },
      ],
      UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    const response = await client.send(command)

    return { content: response.User?.Username };
  } catch (e) {
    console.log(e);
    console.log(event);
    throw new Error(`An unexpected error has occured while processing your request. Details: ${e}`);
  }
}